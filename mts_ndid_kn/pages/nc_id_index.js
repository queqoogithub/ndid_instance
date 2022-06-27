import Link from "next/link";
import { useReducer, useState } from "react";
import Cookies from 'js-cookie';

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_ID_CARD":
      return {
        ...state,
        card_id: action.payload.card_id
      };
    case "UPDATE_NAME":
      return {
        ...state,
        name: action.payload.name
      };
    case "UPDATE_CONTENT":
      return {
        ...state,
        content: action.payload.content
      };
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
}

const initialState = {
  card_id: 9999999999999,
  name: "",
  content: ""
};

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [data, setData] = useState([]);
  const [toVerify, setToVerify] = useState('');
  const [testToken, setTestToken] = useState('');

  console.log('Creden Test Token -> Cookie => ', Cookies.get('credenToken'))

  //  >>> Mockup: MTS Get user with idp list from K'Num (NDID) <<<
  const fetchData = async () => { // users with own's idp list
    const response = await fetch("/api/nc_id");

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const people = await response.json();
    return setData(people);
  };

  //  >>> Mockup: Creden Post (Verify) user (id) and desired idp to MTS to K'Num <<<
  const postData = async () => { // user selected one idp
    const response = await fetch("/api/nc_id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization-Test_Creden": Cookies.get('credenToken')
      },
      body: JSON.stringify(state)
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    dispatch({ type: "CLEAR" });
    const people = await response.json();
    return setToVerify(people);
  };

  return (
    <div style={{ margin: "0 auto", maxWidth: "400px" }}>
      <div style={{ display: "flex", flexDirection: "column" }}><p></p>
        <label htmlFor="name">Token to Cookie</label>
        <input
          type="text"
          id="test_token"
          value={testToken}
          onChange={(e) => {
              setTestToken(e.target.value)
              Cookies.set('credenToken', e.target.value) 
            }
          }
        /><p></p>
        <label htmlFor="name">ID Card</label>
        <input
          type="number"
          id="card_id"
          value={state.card_id}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_ID_CARD",
              payload: { card_id: e.target.value }
            })
          }
        />
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={state.name}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_NAME",
              payload: { name: e.target.value }
            })
          }
        />
        <label htmlFor="content">Content (Desired IdP) </label>
        <input
          type="text"
          id="content"
          value={state.content}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_CONTENT",
              payload: { content: e.target.value }
            })
          }
        />
      </div>
      <div
        style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}
      >
        <button onClick={fetchData}>FETCH</button>
        <button onClick={postData}>CREATE</button>
      </div>
      <div>Data:</div>
      {data ? <pre>{JSON.stringify(data, null, 4)}</pre> : null}
      {toVerify.length > 0 ? (
        <div style={{ textAlign: "center" }}>
          Click a button to go to individual page
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "center"
            }}
          >
            {toVerify.map((person, index) => (
              <Link
                key={index}
                href="/nc_id/[nc_id]"
                as={`/nc_id/${person.id}`}
                passHref
              >
                <span
                  style={{
                    padding: "5px 10px",
                    border: "1px solid black"
                  }}
                >{`${person.name} ${person.content}`}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <p>To verification</p>
      {toVerify ? <pre>{JSON.stringify(toVerify, null, 4)}</pre> : null}
    </div>
  );
}