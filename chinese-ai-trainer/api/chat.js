import OpenAI from "openai"
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res){
  try{
    const { message } = await req.json()
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: `Bạn là giáo viên tiếng Trung. Hãy phản hồi tự nhiên, sửa lỗi nếu cần: ${message}`}]
    })
    res.json({ reply: completion.choices[0].message.content })
  }catch(err){
    res.status(500).json({ error: err.message })
  }
}
