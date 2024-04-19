import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const QuillEditor = () => {
  const [editorContent, setEditorContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAIResponse = async () => {
    // Extract the current selection or prompt from the editor
    const prompt = getSelectedText();
    if (!prompt.trim()) {
      console.error('Prompt is empty.');
      return;
    }

    try {
      setLoading(true);
      const response = await getAIResponse(prompt);
      // Insert the AI response at the current cursor position
      insertAIResponse(response);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedText = () => {
    const selection = window.getSelection();
    return selection.toString().trim();
  };

  const insertAIResponse = (response) => {
    const editor = document.querySelector('.ql-editor');
    const selection = window.getSelection();
    if (editor && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(`\n${response}\n`);
      range.deleteContents();
      range.insertNode(textNode);
    }
  };

  const getAIResponse = async (prompt) => {
    try {
      const apiUrl = "https://chatpostapp-23srkaehza-uc.a.run.app/palm2";
      const response = await axios.post(apiUrl, { user_input: prompt });
      return response.data.content;
    } catch (error) {
      console.error('Error fetching response from AI:', error);
      return 'Error occurred while fetching response from AI.';
    }
  };

  return (
    <div className='bg-grid'>
      {loading && <p>Loading...</p>}
      <div className='quill-editor-container' style={{fontSize:"1rem"}}>
        <ReactQuill 
          theme="snow" 
          value={editorContent} 
          onChange={setEditorContent} 
        />
        <button onClick={handleAIResponse} style={{padding:"1rem", borderRadius:"5px", backgroundColor:"skyblue" ,fontSize:"1rem" ,fontWeight:"bold" , color:"black"}}>Get AI Response</button>
      </div>
    </div>
  );
};

export default QuillEditor;
