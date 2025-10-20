import React, { useState, useEffect } from 'react'

export default function App(){
  const [level, setLevel] = useState('1')
  const [words, setWords] = useState([])
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [recording, setRecording] = useState(false)

  useEffect(()=>{
    fetch(`https://raw.githubusercontent.com/nhtars/hsk-dataset/refs/heads/main/data/hsk${level}.json`)
      .then(r=>r.json()).then(setWords)
  },[level])

  const startRecord = async ()=>{
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    const chunks = []
    mediaRecorder.ondataavailable = e => chunks.push(e.data)
    mediaRecorder.onstop = async ()=>{
      const blob = new Blob(chunks, { type: 'audio/webm' })
      const file = new File([blob], 'audio.webm')
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/transcribe', { method:'POST', body: formData })
      const text = await res.text()
      setMessage(text)
    }
    mediaRecorder.start()
    setRecording(true)
    setTimeout(()=>{ mediaRecorder.stop(); setRecording(false) }, 5000)
  }

  const sendToAI = async ()=>{
    const res = await fetch('/api/chat', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message })
    })
    const data = await res.json()
    setResponse(data.reply)
  }

  return (
    <div className='p-6 max-w-2xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4 text-center'>Chinese AI Trainer 🇨🇳</h1>
      <div className='mb-3 flex justify-center'>
        <label className='mr-2'>Cấp độ HSK:</label>
        <select value={level} onChange={e=>setLevel(e.target.value)} className='border p-1 rounded'>
          {[1,2,3,4,5,6].map(l=><option key={l}>{l}</option>)}
        </select>
      </div>
      <button onClick={startRecord} className='bg-blue-500 text-white px-4 py-2 rounded'>
        {recording? '🎙️ Đang ghi...' : 'Bắt đầu ghi âm'}
      </button>
      {message && <p className='mt-3 text-gray-700'>🗣️ Bạn nói: {message}</p>}
      <button onClick={sendToAI} className='bg-green-500 text-white px-4 py-2 mt-3 rounded'>Gửi tới AI</button>
      {response && <div className='mt-4 p-3 bg-white rounded shadow'><b>Phản hồi:</b> {response}</div>}
      <div className='mt-6'>
        <h2 className='font-semibold mb-2'>Từ vựng HSK{level}</h2>
        <ul className='max-h-60 overflow-y-auto border rounded p-2 bg-white'>
          {words.slice(0,50).map((w,i)=>(
            <li key={i}>{w.simplified} ({w.pinyin}) – {w.translation}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
