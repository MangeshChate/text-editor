import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Header from '@editorjs/header';
import ImageTool from '@editorjs/image';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

const Editor = () => {
  const editorRef = useRef(null);
  const initialized = useRef(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeEditor();
    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy();
      }
    };
  }, []);

  const initializeEditor = () => {
    if (!initialized.current) {
      editorRef.current = new EditorJS({
        holder: 'editorjs',
        tools: {
          paragraph: Paragraph,
          list: List,
          header: Header,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile: async (file) => ({ success: 1, file: { url: URL.createObjectURL(file) } }),
              },
            },
          },
        },
      });
      initialized.current = true;
    }
  };

  const handleAIResponse = async () => {
    if (!editorRef.current) {
      console.error('Editor instance is not initialized');
      return;
    }

    const prompt = getSelectedText();
    if (!prompt.trim()) {
      console.error('Prompt is empty.');
      return;
    }

    try {
      setLoading(true);
      const response = await getAIResponse(prompt);
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
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(response));
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

  const exportToPdf = () => {
    if (!editorRef.current) {
      console.error('Editor instance is not initialized');
      return;
    }

    editorRef.current.save().then((outputData) => {
      const pdfContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
              }
              pre {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>
          <body>
            ${outputData.blocks.map((block) => {
              switch (block.type) {
                case 'paragraph':
                  return `<p>${block.data.text}</p>`;
                case 'header':
                  return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                case 'list':
                  return `<ul>${block.data.items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
                case 'image':
                  return `<img src="${block.data.file.url}" alt="${block.data.caption}" width="${block.data.width}" height="${block.data.height}" />`;
                default:
                  return '';
              }
            }).join('')}
          </body>
        </html>
      `;

      const options = {
        margin: 1,
        filename: 'mydocument.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      };

      html2pdf().set(options).from(pdfContent).save();
    });
  };

  return (
    <div className="App" style={{ fontFamily: 'Arial, sans-serif' }}>
      {loading && <p>Loading...</p>}
      <h1 style={{ textAlign: 'center' }}>My Text Editor</h1>
      <div id="editorjs" className='bg-grid' style={{ border: '2px solid black', margin: '0 auto', maxWidth: '800px', padding: '10px', minHeight: '300px' }}></div>
      <button onClick={handleAIResponse} style={{ display: 'block', margin: '20px auto', padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Get AI Response</button>
      <button onClick={exportToPdf} style={{ display: 'block', margin: '20px auto', padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Export to PDF</button>
    </div>
  );
};

export default Editor;
