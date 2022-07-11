// creden - mts - k'num experiment 
import CountTimer from '../../components/CountTimer'; // timer
import IdpList from '../../components/IdpList'; // idp list
import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { useRouter } from 'next/router'
import CryptoJS from 'crypto-js'
import idps from '../../utils/idps';
import { Switch } from '@headlessui/react'

const User = ({ user_card_id, user_idp_list, user_name }) => {
    const router = useRouter()
    const [toVerify, setToVerify] = useState('')
    const [testToken, setTestToken] = useState('')
    const [cardId, setCardId] = useState(0)
    const [desiredIpd, setDesiredIdp] = useState('')
    const [updateStatus, setUpdateStatus] = useState('')
    const [pendingTime, setPendingTime] = useState(0)
    const [startTS, setStartTs] = useState()
    const [testToggle, setTestToggle] = useState(false)

    console.log('idp was selected: ', desiredIpd)

    useEffect(() => {
      if (user_card_id == 0) { 
        router.push(`/creden?status=${204}`); 
      }
    }, [])

    // test :::: Get & Query Cookie
    // try {
    // const pendingUserCardIdasStr = Cookies.get('pendingUser') // typeof Cookies.get('pendingUser') = string
    // const pendingUserCardId = JSON.parse(pendingUserCardIdasStr) // convert text into a JavaScript object
    // console.log('Cookie Pending Ref ID: ', pendingUserCardId['ref_id']) 
    // } catch (e) { console.log('error when test to query cookies: ', e) }


    // TODO ... Pending Verification
    useEffect(() => {
      console.log('in useEffect !!!')
      if (Cookies.get('pendingUser')) { console.log('the cookies had already set as ', Cookies.get('pendingUser')) }
      if (!Cookies.get('pendingUser')) { console.log('the cookies had NOT already set !!!') }

      // test 
      try {
        var pendingUserCardIdasStr = Cookies.get('pendingUser') // typeof Cookies.get('pendingUser') = string
        var pendingUserCardId = JSON.parse(pendingUserCardIdasStr)
        setStartTs(pendingUserCardId['ts'])
      } catch (e) { console.log('error @fetchStatusData: ', e) }

      const fetchStatusData = async () => {
        await checkVerificationStatus(toVerify['ref_id']) // test
        // try {
        //   const pendingUserCardIdasStr = Cookies.get('pendingUser') // typeof Cookies.get('pendingUser') = string
        //   const pendingUserCardId = JSON.parse(pendingUserCardIdasStr)
        //   //console.log('Pending User JSON',  Cookies.get('pendingUser'))
        //   //const pendingUserCardId = JSON.stringify(pendingUserCardIdasStr)

        //   let currentDate = new Date()
        //   // console.log('Current time: ', currentDate.getTime() / 1000) 
        //   // console.log('Init time: ', pendingUserCardId['ts'])
        //   setStartTs(pendingUserCardId['ts'])
        //   //console.log('Counting time: ', (currentDate.getTime() / 1000) - pendingUserCardId['ts'])

        //   await checkVerificationStatus(pendingUserCardId['ref_id'])
        // } catch (e) { console.log('error @fetchStatusData: ', e) }
      }

      // if (Cookies.get('pendingUser')) { 
      //   const interval = setInterval(fetchStatusData, 5000)
      // }
      const interval = setInterval(async() => {
          
          if (!Cookies.get('pendingUser')) {
            clearInterval(interval);
          }
          await fetchStatusData()
      }, 15000) 
      
    }, [toVerify])

    const verify = async () => { // user selected one idp
        const response = await fetch("/api/nc_id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization-Test-Creden": Cookies.get('credenToken'), // ตอน dev ให้เอา token คุณหนุ่มไปไว้ฝั่ง server (api) อย่าเอาไว้ฝั่ง client !!!
            "Pending-Verification-Time": pendingTime,
          },
          body: JSON.stringify({
            card_id: user_card_id,
            name: user_name,
            content: desiredIpd,
        })
        })
      
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
    
        const pendingUser = await response.json()
        console.log('pending User ===> ', pendingUser)
        Cookies.set('pendingUser', JSON.stringify(pendingUser), { expires: 1 })

        //await checkVerificationStatus(pendingUser['ref_id'])
        setToVerify(pendingUser)

        //return setToVerify(pendingUser)
    }

    const checkVerificationStatus = async (id) => {
        const response = await fetch(`/api/nc_id/${id}`);
    
        if (!response.ok) {
          //throw new Error(`Error: ${response.status}`);
          console.log('>>>>>>>>>>>>>>>>>> respone error @checkVerificationStatus: ', response.status)
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

    const idpIconSelected = user_idp_list
      .map(idp => idps.icons
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
                  <p className='mb-8'>😃 User ID <b> {user_card_id} </b> | {user_name} </p>
                  <span>{JSON.stringify(user_idp_list, null, 4)}</span><br/>
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
                
                {/* idp list component */}
                {/* { !Cookies.get('pendingUser') ?
                <>
                  <div className='h-20 w-96 mb-10 py-2 px-2 text-center'>กรูณาเลือกผู้ให้บริการยืนยันตัวตนที่ท่านเคยลงทะเบียนไว้ เพื่อยืนยันตัวตน ทั้งนี้ท่านจะต้องมีโมบายแอปพลิเคชั่นของผู้ให้บริการดังกล่าว</div>
                  <div className='h-20 w-96 mb-10 py-3 px-2 rounded-md bg-white text-black text-center'>ผู้ให้บริการที่ท่านได้ลงทะเบียน NDID ไว้แล้ว สามารถยืนยันตัวตนได้ทันที</div>
                    <>
                      { idpIconSelected.length <= 4 ?
                      <div className="flex justify-center">
                        { Object.values(idpIconSelected).map((value, index) =>
                        <div key={value.name} > 
                          <img className="mx-1 my-1 h-20 w-20"
                            src={value.image} 
                            alt={value.name} 
                            onClick={async () => setDesiredIdp(value.name)}
                          /> 
                        </div>
                        )}
                      </div>
                      :
                      <div className="grid grid-cols-4 justify-center">
                        { Object.values(idpIconSelected).map((value, index) =>
                        <div key={value.name} > 
                          <img className="mx-1 my-1 h-20 w-20"
                            src={value.image} 
                            alt={value.name} 
                            onClick={async () => setDesiredIdp(value.name)}
                          /> 
                        </div>
                        )}
                      </div>
                      }
                    </>
                  <div className='mt-8'>
                    <button className="my-8 mx-1 bg-[#f8b003] hover:bg-blue-500 text-[#013976] hover:text-white font-bold py-2 px-4 rounded-md" onClick={() => router.back()}>ย้อนกลับ / ยกเลิก</button>
                    <button className="my-8 mx-1 bg-[#f8b003] hover:bg-blue-500 text-[#013976] hover:text-white font-bold py-2 px-4 rounded-md" onClick={verify}>ยืนยัน / ถัดไป</button>
                  </div>
                </> 
                : 
                <div className='grid justify-items-center'>
                  <div className='h-25 w-96 mb-5 py-3 px-2 rounded-md bg-white text-black text-center'>
                    ท่านกำลังยืนยันตัวตนเพื่อใช้งานตามวัตถุประสงค์ของ MTS GOLD และประสงค์ให้ส่งข้อมูลจากธนาคาร {toVerify['selected_bank']} <p className='text-[12px]'>[ Transaction Ref: {toVerify['ref_id']} ]</p> 
                  </div>
                  <div className='h-25 w-96 mb-8 py-3 px-2 rounded-md bg-white text-black text-center'>
                    กรุณายืนยันตัวตนที่โมบายแอปพลิเคชั่นของผู้ให้บริการ ที่ท่านเลือก ภายใน 60 นาที และกลับมาทำรายการต่อที่นี่
                  </div>
                  <p className='my-14'><CountTimer startTs={ startTS } /></p>
                  <button className="my-8 mx-1 bg-[#f53052] hover:bg-blue-500 text-white hover:text-white font-bold py-2 px-4 rounded-md" onClick={() => router.back()}>ย้อนกลับ / ยกเลิก</button>
                </div>
                } */}
                
                {/* NOTE: hello test idp list component! */}
                { !Cookies.get('pendingUser') ? 
                    <IdpList idpIconSelected={idpIconSelected} setDesiredIdp={setDesiredIdp} verify={verify} /> 
                    : 
                    <div className='grid justify-items-center'>
                    <div className='h-25 w-96 mb-5 py-3 px-2 rounded-md bg-white text-black text-center'>
                      ท่านกำลังยืนยันตัวตนเพื่อใช้งานตามวัตถุประสงค์ของ MTS GOLD และประสงค์ให้ส่งข้อมูลจากธนาคาร {toVerify['selected_bank']} <p className='text-[12px]'>[ Transaction Ref: {toVerify['ref_id']} ]</p> 
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
          
        </div>
    )
}

export async function getServerSideProps(context) {
    const { info } = await context.params
    console.log('encrypt info from server = ', info)
    const password = 'secure secret key' // TODO ... env
    const decrypt = (crypted, password) => JSON.parse(CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8)).content
    const decryptedObject = decrypt(info, password)
    console.log('from server decrypt = ', decryptedObject)
    console.log('card_id from server decrypt = ', decryptedObject.info['card_id'])
    const card_id = decryptedObject.info['card_id']
    var user_idp_list = []
    var user_card_id = 0
    var user_name = ""

    // TODO ... check user blacklist -> GET amlo (Knum service)

    // TODO ... GET idp list -> POST verify (Knum service)
    const response = await fetch(`http://localhost:8081/users/${card_id}`)
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }
      
    try {
      const userNdidData = await response.json()
      // TODO ... (1) sanitizing input from html form check id_card, name according to Knum
      //          (2) encrypt ข้อมูล user ที่ user_idp_list เพื่อเช็ค user ที่ user_idp_list == [] แล้วไป decrypt ที่ api/nc_id -> post: verify เพื่อปิดสิทธิ์ req ของ user นี้ 
      //          (3) ป้องกันการ verify ซ้ำ จาก user_idp_list != []
      if (userNdidData == null) {
        console.log('Do not have user in NDID database')
      } else {
        console.log('User NDID Data = ', userNdidData)
        user_name = userNdidData.data['name']
        user_card_id = userNdidData.data['card_id']
        user_idp_list = userNdidData.data['content']
      }
    } catch (e) {
      console.log('Check Status Error: ', e)
    }

    return {
        props: { user_card_id: user_card_id, user_idp_list: user_idp_list, user_name: user_name, }
    }
}

export default User