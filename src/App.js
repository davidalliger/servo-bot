import { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [responses, setResponses] = useState([]);
    const [query, setQuery] = useState({});
    const [errors, setErrors] = useState([]);
    const [prompt, setPrompt] = useState('');
    const apiKey = process.env.REACT_APP_OPENAI_SECRET;

    useEffect(() => {
        if (sessionStorage.getItem("responses")) {
            setResponses(JSON.parse(sessionStorage.getItem("responses")));
        }
    }, []);

    useEffect(() => {
        if (responses.length) {
            sessionStorage.setItem("responses", JSON.stringify(responses));
        }
    }, [responses]);

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (!query.prompt || !query.prompt.length) {
            setErrors(['Please enter a prompt.'])
        } else {
            const response = await fetch("https://api.openai.com/v1/engines/text-curie-001/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify(query)
            });
            if (response.ok) {
                const newResponse = await response.json();
                const answer = [query.prompt, newResponse.choices[0].text];
                setResponses([answer, ...responses]);
                setPrompt('');
                setQuery({});
            } else if (response.status < 500) {
                const data = await response.json();
                if (data.error) {
                    setErrors([data.error.message]);
                }
            } else {
                setErrors(['An error occured. Please try again.'])
            }
        }
    }

    const handleChange = (e) => {
        setQuery({
            prompt: e.target.value,
            temperature: 0.5,
            max_tokens: 100,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0
        });
        setPrompt(e.target.value);
        setErrors([]);
    }

    return (
      <div id="servo">
          <i id="servo-icon" className="fa-solid fa-robot"></i>
          <h1>Servo</h1>
          <h2>The Robot Butler</h2>
          <p><span className='bold'>Servo Says:</span> How may I assist you today?</p>
          <div id="instructions">
              <p>Some examples of things you can ask Servo to do are:</p>
              <ul>
                  <li>
                      "Write a short poem about a melting snowman. The poem should also include a unicycle."
                  </li>
                  <li>
                      "Write a brief review about a book called "Pizza Wars: A Tragedy." The book was very boring."
                  </li>
                  <li>
                      "Translate the following into French: I saw a mime riding in a UFO!"
                  </li>
              </ul>
          </div>
          <form
              id="form"
              onSubmit={handleSubmit}
          >
              <label id="label"
                  htmlFor="textarea"
              >
                  Prompt:
                  <textarea
                      id="textarea"
                      name="textarea"
                      onChange={handleChange}
                      value={prompt}
                  />
                  <div id="button-div">
                      <button id="button">Submit</button>
                  </div>
              </label>
          </form>
          <div id="errors">
              {errors.map((error, index) => (
                  <div className="error" key={`error-${index}`}>{error}</div>
              ))}
          </div>
          <div id="responses">
              {responses.map((response, index) => {
                  const userPrompt = response[0];
                  const servoSays = response[1].split('\n');
                  return (
                  <div className="response-box" key={`response-${index}`}>
                      <div className="user-prompt">
                          <div className="response-label">
                              Prompt:
                          </div>
                          {userPrompt}
                      </div>
                      <div className="servo-says">
                          <div className="response-label">
                              Servo Says:
                          </div>
                          {servoSays.map((line, index) => (
                              <div className="line" id={`line-${index}`}>
                                  {line && (
                                      <>
                                          {line}
                                          <br />
                                      </>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              )})}
          </div>
      </div>
  );
}

export default App;
