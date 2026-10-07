// Envio de e-mail pelo Resend (resend.com).
// Configuração na Vercel (Settings → Environment Variables):
//   RESEND_API_KEY = chave criada no painel do Resend
//   EMAIL_FROM     = remetente com o domínio verificado, ex: Juninho Moro <acesso@juninhomoro.com.br>
//   EMAIL_REPLY_TO = (opcional) para onde vão as respostas; sem ela, vão para suportejmteam@outlook.com
// Sem essas variáveis o app continua funcionando: o cadastro não pede código e os links de acesso
// aparecem no painel do professor para mandar pelo WhatsApp.

import { appendFileSync } from 'fs'

export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY) || process.env.EMAIL_DEV_LOG === '1'
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  // modo de teste local: grava o e-mail num arquivo em vez de enviar
  if (!process.env.RESEND_API_KEY && process.env.EMAIL_DEV_LOG === '1') {
    appendFileSync('/tmp/jm-emails.log', JSON.stringify({ to, subject, html, at: new Date().toISOString() }) + '\n')
    return true
  }
  if (!process.env.RESEND_API_KEY) return false

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Juninho Moro <onboarding@resend.dev>',
        to: [to],
        reply_to: process.env.EMAIL_REPLY_TO || 'suportejmteam@outlook.com',
        subject,
        html,
      }),
    })
    if (!res.ok) console.error('[email] falhou', res.status, await res.text())
    return res.ok
  } catch (err) {
    console.error('[email] erro', err)
    return false
  }
}

// ---------- modelos ----------
function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#0f0923;font-family:Arial,Helvetica,sans-serif;color:#ffffff">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="font-weight:800;font-size:22px;letter-spacing:.04em;margin:0 0 24px">JM <span style="color:#F5B300">TEAM</span></p>
    <h1 style="font-size:20px;line-height:1.3;margin:0 0 16px">${title}</h1>
    ${body}
    <p style="color:#8f87ad;font-size:12px;margin-top:32px">Juninho Moro · Personal trainer<br>Dúvidas? Responda este e-mail ou chame no WhatsApp.</p>
  </div></body></html>`
}

const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${href}" style="display:inline-block;background:#F5B300;color:#0f0923;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px">${label}</a></p>
   <p style="color:#8f87ad;font-size:12px;word-break:break-all">Se o botão não abrir, copie este link: ${href}</p>`

export const emailTemplates = {
  code: (name: string, code: string) => ({
    subject: `${code} é o seu código de confirmação`,
    html: layout(
      `Oi, ${name.split(' ')[0]}! Confirme seu e-mail`,
      `<p style="color:#cfc8e8">Digite este código no app para terminar o cadastro:</p>
       <p style="font-size:34px;font-weight:800;letter-spacing:.3em;color:#FFD166;margin:16px 0">${code}</p>
       <p style="color:#8f87ad;font-size:13px">O código vale por 30 minutos.</p>`
    ),
  }),
  purchaseNewAccount: (name: string, product: string, link: string) => ({
    subject: `Seu acesso ao ${product} está liberado`,
    html: layout(
      `${name.split(' ')[0]}, sua planilha ${product} já está no app 💪`,
      `<p style="color:#cfc8e8">Crie sua senha para entrar. Depois é só abrir o app e começar a semana 1.</p>
       ${button(link, 'Criar minha senha')}
       <p style="color:#8f87ad;font-size:13px">O link vale por 7 dias.</p>`
    ),
  }),
  purchaseExisting: (name: string, product: string, appUrl: string) => ({
    subject: `${product} liberado no seu app`,
    html: layout(
      `${name.split(' ')[0]}, o ${product} já está na sua conta`,
      `<p style="color:#cfc8e8">Entre no app com o seu e-mail e senha de sempre. A planilha aparece na aba Planilhas.</p>
       ${button(appUrl, 'Abrir o app')}`
    ),
  }),
  invite: (name: string, link: string) => ({
    subject: 'Seu acesso à consultoria com o Juninho',
    html: layout(
      `Bem-vindo ao time, ${name.split(' ')[0]}!`,
      `<p style="color:#cfc8e8">Crie sua senha para entrar no app. Seu treino aparece lá assim que estiver pronto.</p>
       ${button(link, 'Criar minha senha')}
       <p style="color:#8f87ad;font-size:13px">O link vale por 7 dias.</p>`
    ),
  }),
  reset: (name: string, link: string) => ({
    subject: 'Crie uma nova senha',
    html: layout(
      `Oi, ${name.split(' ')[0]}. Vamos criar uma senha nova`,
      `<p style="color:#cfc8e8">Recebemos um pedido para trocar sua senha. Se não foi você, ignore este e-mail.</p>
       ${button(link, 'Criar nova senha')}
       <p style="color:#8f87ad;font-size:13px">O link vale por 1 dia.</p>`
    ),
  }),
}
