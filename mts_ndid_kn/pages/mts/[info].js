import CountTimer from '../../components/CountTimer'; 
import IdpList from '../../components/IdpList'; 
import { useState, useEffect, useMemo } from "react";
import Cookies from 'js-cookie';
import { useRouter } from 'next/router'
import CryptoJS from 'crypto-js'
import idps from '../../utils/idps';
import idps_knum from '../../utils/idps_knum';
import { Switch } from '@headlessui/react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const User = ({ user_card_id, user_idp_list, user_firstname, user_lastname }) => {
    const router = useRouter()
    const [toVerify, setToVerify] = useState('')
    const [testToken, setTestToken] = useState('')
    const [cardId, setCardId] = useState(0)
    const [desiredIpd, setDesiredIdp] = useState('')
    const [updateStatus, setUpdateStatus] = useState('')
    const [pendingTime, setPendingTime] = useState(0)
    const [startTS, setStartTs] = useState()
    const [testToggle, setTestToggle] = useState(false)

    //console.log('idp was selected: ', desiredIpd)

    useEffect(() => {
      if (user_card_id == 0) { 
        router.push(`/creden?status=${204+" : id do not exist!"}`); 
      }
      if (user_idp_list == []) {
        router.push(`/creden?status=${204+" : empty idps!"}`); 
      }
    }, [])

    useMemo(() => {
      console.log('in useEffect !!!!!!!!!!!!!!')
      if (Cookies.get('pendingUser')) { console.log('the cookies had already set as ', Cookies.get('pendingUser')) }
      if (!Cookies.get('pendingUser')) { console.log('the cookies had NOT already set !!!') }

      // get / perform cookie data  
      try {
        var pendingUserCardIdasStr = Cookies.get('pendingUser') // typeof Cookies.get('pendingUser') = string
        var pendingUserCardId = JSON.parse(pendingUserCardIdasStr)
        setStartTs(pendingUserCardId['ts'])
        console.log('set start TS')
      } catch (e) { console.log('error @fetchStatusData: ', e) }

      const fetchStatusData = async () => {
        //await checkVerificationStatus(toVerify['ref_id']) 
        await checkVerifyDataStatus(toVerify['reference_id'])
      }

      if(Cookies.get('pendingUser')){
      const interval = setInterval(async() => {
          if (!Cookies.get('pendingUser')) {
            clearInterval(interval);
          }
          await fetchStatusData()
      }, 15000) 
      }
    }, [toVerify])

    const notify = () => toast("ไม่พบผู้ให้บริการ กรุณาเลือกธนาคารอื่น");

    const verifyData = async(selected_idp_name) => {
      const selected_idp_uuid = idps_knum.icons.find((c) => selected_idp_name == c.name).uuid
      const selected_idp_marketing_name = idps_knum.icons.find((c) => selected_idp_name == c.name).marketing_name

      const res = await fetch("/api/knum/verify/verify_data", {
        method: "POST",
        headers: {
          'Accept': 'application/json, text/plain, */*',
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: user_card_id,
          selected_idp_uuid: selected_idp_uuid,
          selected_idp_marketing_name: selected_idp_marketing_name,
      })
      })

      if (!res.ok) {
        notify()
      }

      const pendingUser = await res.json()
      Cookies.set('pendingUser', JSON.stringify(pendingUser), { expires: 1 })
      console.log('verifyData res = ', pendingUser)
      setToVerify(pendingUser)
    }

    const verify = async (idp_name) => { // user selected one idp
        const response = await fetch("/api/nc_id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization-Test-Creden": Cookies.get('credenToken'), // ตอน dev ให้เอา token คุณหนุ่มไปไว้ฝั่ง server (api) อย่าเอาไว้ฝั่ง client !!!
            "Pending-Verification-Time": pendingTime,
          },
          body: JSON.stringify({
            card_id: user_card_id,
            //name: user_name,
            //content: desiredIpd,
            content: idp_name,
        })
        })
      
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const pendingUser = await response.json()
        console.log('pending User ===> ', pendingUser)
        Cookies.set('pendingUser', JSON.stringify(pendingUser), { expires: 1 })
        setToVerify(pendingUser)
        //return setToVerify(pendingUser)
    }

    const checkVerifyDataStatus = async(reference_id) => {
      if (Cookies.get('pendingUser')) {
        try {
          const res = await fetch(`/api/knum/verify/status/${reference_id}`);
          console.log('check verified status of ', res.ok)
          if (res.ok) {
            const status = await res.json()
            console.log('in checking the status: ',  status.status)
            if (status.status == 'VERIFIED') {
              Cookies.remove('pendingUser')
              router.push(`/creden?status=${status.status}`);
            }
            // Todo ... another res status
          }
          console.log('check verified !!!!')
        } catch (e) { 
          console.log('error as a check status: ', e) 
        }
        
      }
    }

    const checkVerificationStatus = async (id) => {
      if (Cookies.get('pendingUser')) {
        const response = await fetch(`/api/nc_id/${id}`);
    
        if (!response.ok) {
          //throw new Error(`Error: ${response.status}`);
          console.log('respone error @checkVerificationStatus: ', response.status)
        }
        try {
          const people = await response.json()
          setUpdateStatus(people)
          console.log('immediated status = ', people['status'])
          if (people['status'] == 'verified') { // ok = verified
            console.log('VERIFIED !!! & DELETE COOKIE')
            Cookies.remove('pendingUser')

            setToVerify('')

            //router.push(`/creden`);
            router.push(`/creden?status=${people['status']}`);

          }
          if (people['status'] == 'reject') {
            console.log('REJECT !!! & DELETE COOKIE')

            // TODO ... msg for reject status
            Cookies.remove('pendingUser')

            setToVerify('')

            router.push(`/creden?status=${people['status']}`);
          }

        } catch (e) {
          console.log('Check Status Error: ', e)
        }
      }
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
                      <button className="my-8 mx-1 bg-[#f8b003] hover:bg-blue-500 text-[#013976] hover:text-white font-bold py-2 px-4 rounded-md" onClick={() => router.back()}>ย้อนกลับ / ยกเลิก</button>
                      <button className="my-8 mx-1 bg-[#f8b003] hover:bg-blue-500 text-[#013976] hover:text-white font-bold py-2 px-4 rounded-md" onClick={verify}>ยืนยัน / ถัดไป</button>
                  </div>
                  
                </div>
                : null}
                
                {/* NOTE: hello test idp list component! */}
                { !Cookies.get('pendingUser') ? 
                    <IdpList idpIconSelected={idpIconSelected} verify={verifyData} /> 
                    : 
                    <div className='grid justify-items-center'>
                    <div className='h-25 w-96 mb-5 py-3 px-2 rounded-md bg-white text-black text-center'>
                      ท่านกำลังยืนยันตัวตนเพื่อใช้งานตามวัตถุประสงค์ของ MTS GOLD และประสงค์ให้ส่งข้อมูลจากธนาคาร {toVerify['selected_bank']} <p className='text-[12px]'>[ Transaction Ref: {toVerify['reference_id']} ]</p> 
                    </div>
                    <div className='h-25 w-96 mb-8 py-3 px-2 rounded-md bg-white text-black text-center'>
                      กรุณายืนยันตัวตนที่โมบายแอปพลิเคชั่นของผู้ให้บริการ ที่ท่านเลือก ภายใน 60 นาที และกลับมาทำรายการต่อที่นี่
                    </div>
                    <p className='my-14'><CountTimer startTs={ startTS } /></p>
                    <button className="my-8 mx-1 bg-[#ef4444] hover:bg-blue-500 text-white hover:text-white font-bold py-2 px-4 rounded-md" onClick={() => router.back()}>ย้อนกลับ / ยกเลิก</button>
                  </div>
                }

            </div>

            {(toVerify && testToggle) ? <><p>To verify: </p><pre>{JSON.stringify(toVerify, null, 4)}</pre></> : null}

            <footer className="font-sans flex h-24 items-center justify-center text-blue-400 hover:text-[#1da1f2]">
            ©️ Powered by{' '}BDEV
            </footer>

            <ToastContainer />
          
        </div>
    )
}

export async function getServerSideProps(context) {
    const { info } = await context.params
    //console.log('encrypt info from server = ', info)
    const password = 'secure secret key' // TODO ... env
    const decrypt = (crypted, password) => JSON.parse(CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8)).content
    const decryptedObject = decrypt(info, password)
    const card_id = decryptedObject.info['card_id']
    // var user_idp_list = []
    // var user_card_id = 0
    // var user_firstname = ""
    // var user_lastname = ""

    // TODO ... check user blacklist -> GET AMLO (Knum service)

    // @(Knum service) ... (1) POST:idps -> idp_list (2) GET:authoritative_source ->  (node_id = as_id_list) (3) POST:verify data -> ref_id (4) check verify status -> status 
    
    const idps_res = await fetch("http://localhost:8081/ndid/idps", {
    //const res = await fetch(process.env.KNUM_DRUPAL, { // uat-knum
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_API_TOKEN}` // process.env.TEST_API_TOKEN
        //'Authorization': `Bearer ${process.env.KNUM_TOKEN}` // uat-knum
      },
      body: JSON.stringify({
        "min_aal": 2.2,
        "min_ial": 2.3,
        "namespace": "citizen_id",
        "identifier": card_id,
        "on_the_fly_support": true
      })
    })

    console.log('res do not ok: ', !idps_res.ok)
    const idps = await idps_res.json();
    console.log('IDPS: ', idps);

    if(idps.error) {
      console.log('IDPS error: ', idps.error)
    }

    if(!idps_res.ok) {
      return {
          redirect: {
          destination: '/creden?status=204',
          permanent: false,
        },
      }
    }

    if(idps == []) {
      return {
          redirect: {
          destination: '/creden?status=205',
          permanent: false,
        },
      }
    }

    const idp_user_regis = idps.map((idp) => (idps_knum.icons.find((c) => c.uuid == idp.id))).map((d) => d.name)
    console.log('idp_user_regis = ', idp_user_regis)

    const as_res = await fetch(`http://localhost:8081/ndid/as/001.cust_info_001`, {
      method: 'get',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_API_TOKEN}` 
        //'Authorization': `Bearer ${process.env.KNUM_TOKEN}` // uat-knum
      }
    });

    const as = await as_res.json();
    console.log('as = ', as)
    const sample_select_idp = 'Mock 1'
    const as_match_idp = as.find((a) => a.node_name.marketing_name_en == sample_select_idp).node_id
    console.log('as_match_idp (node_id) = ', as_match_idp)
    console.log('chk uuid from name', idps_knum.icons.find((c) => c.name == 'mock_1').uuid)

    const user_card_id = card_id
    const user_firstname = decryptedObject.info['firstname']
    const user_lastname = decryptedObject.info['lastname']
    const user_idp_list = idp_user_regis

    // if (!response.ok) {
    //   throw new Error(`Error: ${response.status}`)
    // }
      
    // try {
    //   const userNdidData = await response.json()
    //   // TODO ... (1) sanitizing input from html form check id_card, name according to Knum
    //   //          (2) encrypt ข้อมูล user ที่ user_idp_list เพื่อเช็ค user ที่ user_idp_list == [] แล้วไป decrypt ที่ api/nc_id -> post: verify เพื่อปิดสิทธิ์ req ของ user นี้ 
    //   //          (3) ป้องกันการ verify ซ้ำ จาก user_idp_list != []
    //   if (userNdidData == null) {
    //     console.log('Do not have user in NDID database')
    //   } else {
    //     console.log('User NDID Data = ', userNdidData)
    //     user_name = userNdidData.data['name']
    //     user_card_id = userNdidData.data['card_id']
    //     user_idp_list = userNdidData.data['content']
    //   }
    // } catch (e) {
    //   console.log('Check Status Error: ', e)
    // }

    return {
        props: { user_card_id: user_card_id, user_idp_list: user_idp_list, user_firstname: user_firstname, user_lastname: user_lastname, }
    }
}

export default User