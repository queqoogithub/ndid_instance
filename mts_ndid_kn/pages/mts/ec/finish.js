import { useRouter } from 'next/router'

const Final = () => {
    const router = useRouter()

    return (
        <div className="font-Prompt bg-[#013976] flex min-h-screen flex-col items-center py-10 text-gray-50">
            <div className='grid justify-items-center'>
                <div className=''>
                    <img className="contrast-125 scale-75 rounded-2xl " src="/mts_logo.jpg" alt="mts_logo"/>
                </div>
                
                {/* NOTE: todo ... redirect to creden page */}
                     
                    <div className='grid justify-items-center '>
                        <div className='h-25 w-90 mb-5 mt-10 py-10 px-10 rounded-md bg-white text-black '>
                            <p className='text-[25px] text-center font-semibold '>ท่านได้ทำการยืนยันตัวเรียบร้อยแล้ว</p>
                            <div className='grid justify-items-center mt-4'><img className="contrast-125 scale-10 rounded-2xl object-scale-down h-40 w-40" src="/correct_icon.png" alt="correct"/></div>
                        </div>
                        <button className="my-8 mx-1 bg-[#ef4444] hover:bg-blue-500 text-white hover:text-white font-bold py-2 px-4 rounded-md" onClick={() => router.back()}>กลับหน้าแรก</button>
                    </div>
                
            </div>
            <footer className="font-sans flex h-24 items-center justify-center text-blue-400 hover:text-[#1da1f2]">
            ©️ Powered by{' '}BDEV
            </footer>
        </div>
    )   
}

export default Final