import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router'
import CountTimer from "./CountTimer";

export default function IdpList({ idpIconSelected, setDesiredIdp, verify }) {
    const router = useRouter()
    
    return (
        <>
            <div className='h-20 w-96 mb-10 py-2 px-1 text-center'>กรูณาเลือกผู้ให้บริการยืนยันตัวตนที่ท่านเคยลงทะเบียนไว้ เพื่อยืนยันตัวตน ทั้งนี้ ท่านจะต้องมีโมบายแอปพลิเคชั่น ของผู้ให้บริการดังกล่าว</div>
            <div className='h-20 w-96 mb-10 py-3 px-2 rounded-md bg-white text-black text-center'>ผู้ให้บริการที่ท่านได้ลงทะเบียน NDID ไว้แล้ว สามารถยืนยันตัวตนได้ทันที</div>
            <>
                {idpIconSelected.length <= 4 ?
                    <div className="flex justify-center">
                        {Object.values(idpIconSelected).map((value, index) =>
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
                        {Object.values(idpIconSelected).map((value, index) =>
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
    )
}