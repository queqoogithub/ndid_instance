import Link from "next/link";
import { useReducer, useState } from "react";
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js'
import { useRouter } from 'next/router';

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
    case "UPDATE_APPTYPE":
      return {
        ...state,
        apptype: action.payload.apptype
      };
    case "CLEAR":
      return initialState;
    default:
      return state;
  }
}

const initialState = {
  card_id: 9999999999999,
  firstname: "test1",
  apptype: "abc",
};

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [data, setData] = useState([]);
  const [toVerify, setToVerify] = useState('');
  const [testToken, setTestToken] = useState('');
  const [cardID, setCardID] = useState(0);
  const [updateStatus, setUpdateStatus] = useState('');
 
  //console.log('Creden Test Token -> Cookie => ', Cookies.get('credenToken'))
  const router = useRouter();

  //  >>> Mockup: Creden Post (User Data) to MTS <<< 
  const postUserData = async () => { 
    // TODO ... hash (md5 or sha1) card_id before routing
    const response = await fetch(`/api/mts/mts_ndid/${state.card_id}`, { // test ...
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO ... sign Token for MTS private endpoint
        //"Authorization-Test-Creden": Cookies.get('credenToken'),
      },
      body: JSON.stringify(state)
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    dispatch({ type: "CLEAR" });
    const people = await response.json();
    console.log('from client: ', people)
    return setToVerify(people);
  };

  // test cryptoJS
//   const testCryptoJS = async () => {
//     //var CryptoJS = require("crypto-js");

//     const password = 'secure secret key'
//     const encrypt = (content, password) => CryptoJS.AES.encrypt(JSON.stringify({ content }), password).toString()
//     const decrypt = (crypted, password) => JSON.parse(CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8)).content

//     // Encrypt
//     const encryptedString = encrypt('This is a string', password)
//     const encryptedObject = encrypt({ test: 'This is an object' }, password)
//     console.log(encryptedString)
//     console.log(encryptedObject)

//     // Decrypt
//     const decryptedString = decrypt(encryptedString, password)
//     const decryptedObject = decrypt(encryptedObject, password)
//     console.log(decryptedString)
//     console.log(decryptedObject)
//   }

  //testCryptoJS();

  // TODO ... pass user info with encrypt params
  const passUserInfo = async () => {

    const password = 'secure secret key'; // TODO ... env
    const encrypt = (content, password) => CryptoJS.AES.encrypt(JSON.stringify({ content }), password).toString()
    const decrypt = (crypted, password) => JSON.parse(CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8)).content
    // Encrypt
    const encryptedObject = encrypt({ info: state }, password)
    console.log('encrypt = ', encryptedObject)
    // Decrypt
    const decryptedObject = decrypt(encryptedObject, password)
    console.log('decrypt = ', decryptedObject)

    // Encode / Decode URI เรา Encode เพื่อกำจัด "/" 
    const urlEncode = encodeURIComponent(encryptedObject.toString())
    console.log('encrypt uri = ', urlEncode)
    console.log('decrypt uri = ', decodeURIComponent(urlEncode))

    router.push(`/mts/${urlEncode}`); // info

  }

  return (
    <div style={{ margin: "0 auto", maxWidth: "400px" }}>
      <div style={{ display: "flex", flexDirection: "column" }}><p></p>
        <h3>🦄 <b>Creden Form Instance</b></h3>
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
        <label htmlFor="name">Application Type</label>
        <input
          type="text"
          id="apptype"
          value={state.apptype}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_APPTYPE",
              payload: { apptype: e.target.value }
            })
          }
        />
      </div>
      <div
        style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}
      >
        <button onClick={passUserInfo}>TO MTS PAGE</button>
      </div>
      <div>Data:</div>
      {data ? <pre>{JSON.stringify(data, null, 4)}</pre> : null}

    </div>
  );
}