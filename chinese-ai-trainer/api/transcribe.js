import OpenAI from "openai"
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
export const config = { api: { bodyParser: false } }

export default async function handler(req, res){
  try{
    const form = await req.formData()
    const file = form.get('file')
    const transcript = await client.audio.transcriptions.create({
      model: "whisper-1", file
    })
    res.send(transcript.text)
  }catch(e){
    res.status(500).send(e.message)
  }
}
