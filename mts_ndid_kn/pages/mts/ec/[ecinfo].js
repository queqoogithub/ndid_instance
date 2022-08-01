import CountTimer from '../../../components/CountTimer'; 
import IdpList from '../../../components/IdpList'; 
import { useState, useEffect, useMemo, useCallback } from "react";
import Cookies from 'js-cookie';
import { useRouter } from 'next/router'
import CryptoJS from 'crypto-js'
import idps_knum from '../../../utils/idps_knum';
//import { userIdpsAndAsLogging, userAmloLogging } from '../../../utils/Logger'; // data logger
import { Switch } from '@headlessui/react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const User = ({ user_card_id, user_idp_list, user_firstname, user_lastname, user_info }) => {
    const router = useRouter()
    const [testToken, setTestToken] = useState('')
    const [cardId, setCardId] = useState(0)
    const [desiredIpd, setDesiredIdp] = useState('')
    const [updateStatus, setUpdateStatus] = useState('')
    const [pendingTime, setPendingTime] = useState(0)
    const [startTS, setStartTs] = useState()
    const [testToggle, setTestToggle] = useState(false)

    const [trigFetchingStatus, setTrigFetchingStatus] = useState(false)

    Cookies.set('userCardId', user_card_id, { expires: 1 })
    console.log('userCardId = ', Cookies.get('userCardId'))

    // useEffect(() => {
    //   if(Cookies.get('pendingUser')) {
    //     fetchingStatus();
    //   }
    // }, [])

    // mount for interval fetching
    const fetchingStatus = async() => {
      //clearInterval(interval); // TEST var order declaration
      const pendingUserCardIdasStr = await Cookies.get('pendingUser') // typeof Cookies.get('pendingUser') = string
      const pendingUserCardId = await JSON.parse(pendingUserCardIdasStr)
      setStartTs(pendingUserCardId['ts'])
      const interval = setInterval(() => {
        console.log('in the interval >>>>> MEMO <<<<< ref id = ', pendingUserCardId['reference_id']) // refId
        if(!Cookies.get('pendingUser')) { clearInterval(interval); }
        checkVerifyDataStatus(pendingUserCardId['reference_id'], pendingUserCardId['pairRefId'], interval)
      }, 15000)
    }

    const backOrCancel = async() => {
      console.log('timeout -> back to page')
      await Cookies.remove('pendingUser')
      router.back(`/creden?status=${'timeout'}`)
    }

    const notify = () => toast("ไม่พบผู้ให้บริการ กรุณาเลือกธนาคารอื่น");

    const verifyData = async(selected_idp_name) => {
      const selected_idp_uuid = idps_knum.icons.find((c) => selected_idp_name == c.name).uuid
      const selected_idp_marketing_name = idps_knum.icons.find((c) => selected_idp_name == c.name).marketing_name

      const res = await fetch("/api/knum/verify/verify_data", {
        method: "POST",
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "Pair-Identity-Info": user_info // Cookies.get('userInfo') 
        },
        body: JSON.stringify({
          identifier: user_card_id, // Cookies.get('userCardId'), 
          selected_idp_uuid: selected_idp_uuid,
          selected_idp_marketing_name: selected_idp_marketing_name,
        })
      })

      if (!res.ok) {
        notify()
      }

      const pendingUser = await res.json()
      Cookies.set('pendingUser', JSON.stringify(pendingUser), { expires: 1 })
      console.log('pending_user_res = ', pendingUser)
      //setStartTs(pendingUser['ts'])
      await fetchingStatus()
    }

    const checkVerifyDataStatus = async(reference_id, pair_reference_id, interval) => {
      console.log('ref_id  >>>>', reference_id)
      console.log('pair_ref_id  >>>>', pair_reference_id)
      if (Cookies.get('pendingUser')) {
        try {
          const res = await fetch(`/api/knum/verify/status/${reference_id}`, {
            //method: "GET",
            headers: {
              "Accept": "application/json, text/plain, */*",
              "Content-Type": "application/json",
              "Pair-Identity-Ref": pair_reference_id //toVerify['pairRefId'] // ใช้ pairRefId แล้วทำไม 404 ?  
            },
          });
          console.log('check verified status ok? ', res.ok)
          if (res.ok) {
            const status = await res.json()
            console.log('in checking the status: ',  status.status)
            if (status.status == 'VERIFIED') {
              //setTrigFetchingStatus(false);
              Cookies.remove('pendingUser')
              //Cookies.remove('userInfo') // user_info
              //Cookies.remove('userCardId') // user_card-id
              clearInterval(interval);
              router.push(`/creden?status=${status.status}`);
            }
            // Todo ... another res status
            if (status.status == 'REJECT') {
              setTrigFetchingStatus(false);
            }
          }
          console.log('check verified !!!!')
        } catch (e) { 
          console.log('error as a check status: ', e) 
        }
        
      }
      //return clearInterval(interval);
    }

    const idpIconSelected = user_idp_list
      .map(idp => idps_knum.icons
        .find(icon => icon.name == idp))
          .filter(icon => icon != null)
    
    //console.log('idpIconSelected = ', Object.values(idpIconSelected).map((value, index) => value.image))

    return (
        <div className="font-Prompt bg-[#013976] flex min-h-screen flex-col items-center py-10 text-gray-50">
            <div className='grid justify-items-center'>
                <div className=''>
                    <img className="contrast-125 scale-75 rounded-2xl " src="/mts_logo.jpg" alt="mts_logo"/>
                </div>
                <Switch
                  checked={testToggle}
                  onChange={setTestToggle}
                  className={`${
                    testToggle ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full my-3 `}
                >
                  <span className="sr-only">Enable notifications</span>
                  <span
                    className={`${
                      testToggle ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white`}
                  />
                </Switch>
                
                {/* toggle for test */}
                {testToggle ? 
                  <div className='grid justify-items-center mb-8'>
                  <p className='mb-8'>😃 ID <b> {user_card_id} </b> / {user_firstname} {user_lastname} / {JSON.stringify(user_idp_list, null, 4)} </p>
                  <label className="py-2" htmlFor="name">Check Verification Status (Ref ID)</label>
                  <input className="rounded-md border p-1 text-blue-600"
                      type="number"
                      id="card_id"
                      value = {cardId}
                      onChange={(e) => {
                          setCardId(e.target.value)
                          checkVerificationStatus(e.target.value)
                      }}
                  /><p></p>
                  {updateStatus ? <pre>{JSON.stringify(updateStatus, null, 4)}</pre> : null}
                  <label className="py-2" htmlFor="name">Token to Cookie</label>
                  <input className="rounded-md border p-1 text-blue-600"
                  type="text"
                  id="test_token"
                  value={testToken}
                  onChange={(e) => {
                      setTestToken(e.target.value)
                      Cookies.set('credenToken', e.target.value) 
                      }
                  }
                  />
                  <label className="py-2" htmlFor="name">Pending Verification <b>Test Time</b> (ms.)</label>
                  <input className="rounded-md border p-1 text-blue-600"
                  type="number"
                  id="test_pending_time"
                  value={pendingTime}
                  onChange={(e) => {
                      setPendingTime(e.target.value)
                      }
                  }
                  /><p></p>
                  <label className="py-2" htmlFor="content">Desired IdP</label>
                  <input className="rounded-md border p-1 text-blue-600"
                  type="text"
                  id="content"
                  value={desiredIpd}
                  onChange={(e) => 
                    setDesiredIdp(e.target.value)
                  }
                  />
                  <div>
                      <button className="my-8 mx-1 bg-green-500 hover:bg-blue-500 text-[#013976] hover:text-white font-bold py-2 px-4 rounded-md" onClick={() => setStartTs(startTS+600)}>( ➕ ) Ts</button>
                      <button className="my-8 mx-1 bg-orange-500 hover:bg-blue-500 text-[#013976] hover:text-white font-bold py-2 px-4 rounded-md" onClick={() => setStartTs(startTS-600)}>( ➖ ) Ts</button>
                  </div>
                  
                </div>
                : null}
                
                {/* NOTE: hello test idp list component! */}
                { !Cookies.get('pendingUser') ? 
                    <IdpList idpIconSelected={idpIconSelected} verify={verifyData} /> 
                    : 
                    <div className='grid justify-items-center'>
                    <div className='h-25 w-96 mb-5 py-3 px-2 rounded-md bg-white text-black text-center'>
                      ท่านกำลังยืนยันตัวตนเพื่อใช้งานตามวัตถุประสงค์ของ MTS GOLD และประสงค์ให้ส่งข้อมูลจากธนาคาร <p className='text-[12px]'>[ Transaction Ref: {  } ]</p> 
                    </div>
                    <div className='h-25 w-96 mb-8 py-3 px-2 rounded-md bg-white text-black text-center'>
                      กรุณายืนยันตัวตนที่โมบายแอปพลิเคชั่นของผู้ให้บริการ ที่ท่านเลือก ภายใน 60 นาที และกลับมาทำรายการต่อที่นี่
                    </div>
                    <div className='my-14'><CountTimer startTs={ startTS } /></div>
                    <button className="my-8 mx-1 bg-[#ef4444] hover:bg-blue-500 text-white hover:text-white font-bold py-2 px-4 rounded-md" onClick={() => router.back()}>ย้อนกลับ / ยกเลิก</button>
                  </div>
                }
            </div>
            <footer className="font-sans flex h-24 items-center justify-center text-blue-400 hover:text-[#1da1f2]">
            ©️ Powered by{' '}BDEV
            </footer>
            <ToastContainer />
        </div>
    )
}

export async function getServerSideProps(context) {
    const { ecinfo } = await context.params
    console.log('context params ecinfo: ', ecinfo)
    const password = process.env.SECRETE_KEY // TODO ... env
    const decrypt = (crypted, password) => JSON.parse(CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8)).content
    const decryptedObject = decrypt(ecinfo, password)
    console.log('decryptedObject: ',decryptedObject)
    const card_id = decryptedObject.info['card_id']

    // @(Knum service) ... (1) POST:idps -> idp_list (2) GET:authoritative_source ->  (node_id = as_id_list) (3) POST:verify data -> ref_id (4) check verify status -> status 

    const user_card_id = card_id
    const user_firstname = decryptedObject.info['firstname']
    const user_lastname = decryptedObject.info['lastname']
    const user_idp_list = decryptedObject.info['user_idps']

    return {
        props: { user_card_id: user_card_id, user_idp_list: user_idp_list, user_firstname: user_firstname, user_lastname: user_lastname, user_info: ecinfo,}
    }
}

export default User