from fastapi import FastAPI, Body, Depends, status, Response
from fastapi.middleware.cors import CORSMiddleware # T-T 

#from rsa import verify
#from sqlalchemy import null

from app.model import PostSchema, UserSchema, UserLoginSchema, VerifySchema, IdpSchema, VerifyDataSchema, CidSchema
from app.auth.auth_bearer import JWTBearer
from app.auth.auth_handler import signJWT

from datetime import datetime

from app.sample_data import amlo_res


posts = [
    {
        "id": 1,
        "card_id": 4444449999999,
        "name": "Pancake",
        "content": ["scb", "ktb", "kkp", "baac", "bbl", "citi", "ibank", "kbank"]
    },
    {
        "id": 2,
        "card_id": 3333399999999,
        "name": "Kiki",
        "content": ["ttb", "kbank", "boa", "citi"]
    },
    {
        "id": 3,
        "card_id": 1111199999999,
        "name": "Apple",
        "content": ["bbc", "kbank"]
    },
    {
        "id": 4,
        "card_id": 2222299999999,
        "name": "Luffy",
        "content": []
    },
    {
        "id": 5,
        "card_id": 1234599999999,
        "name": "Steve",
        "content": ["gsb", "kbank"]
    },
    {
        "id": 6,
        "card_id": 5555599999999,
        "name": "Yoyo",
        "content": ["tisco"]
    },
    {
        "id": 7,
        "card_id": 9898999999999,
        "name": "Yoyo",
        "content": ["tisco", "scb", "citi"]
    },
]

pending_verify_users = [
    {
        "id": 1,
        "card_id": 4444449999999,
        "name": "Pancake",
        "selected_bank": "scb",
        "status": "pending"
    },
    {
        "id": 2,
        "card_id": 1111199999999,
        "name": "Apple",
        "selected_bank": "kbank",
        "status": "verified"
    },
]

users = []

app = FastAPI(
    title="BDEV-CREDEN-KNUM MOCKUP",
    description="The newbie mockup provides testing as Creden and K'Num. We can opt between Creden or K'Num in the mockup.",
    version="0.0.1"
)

# Set CORS
origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to your blog!."}


@app.get("/posts", tags=["posts"])
async def get_posts() -> dict:
    return { "data": posts }


@app.get("/posts/{id}", tags=["posts"])
async def get_single_post(id: int) -> dict:
    if id > len(posts):
        return {
            "error": "No such post with the supplied ID."
        }

    for post in posts:
        if post["id"] == id:
            return {
                "data": post
            }

# To modify post/{id} -> users/{card_id}
@app.get("/users/{card_id}", tags=["posts"])
async def get_single_post(card_id: int) -> dict:
    for post in posts:
        if post["card_id"] == card_id:
            return {
                "data": post
            }

@app.get("/pending_verify_users", tags=["pending_verify_users"])
async def get_pending_verify() -> dict:
    return { "data":  pending_verify_users}

@app.post("/posts", dependencies=[Depends(JWTBearer())], tags=["posts"])
async def add_post(post: PostSchema) -> dict:
    post.id = len(posts) + 1
    posts.append(post.dict())
    return {
        "data": "post added."
    }

# todo ... verify simulation ----------------------------------------------- start #
@app.post("/verify", dependencies=[Depends(JWTBearer())], tags=["posts"])
async def bank_verify(post: VerifySchema) -> dict:
    # Todo ... pending time (< 1h)
    print('check post user: ', check_post_user_card_id(post))
    if  check_post_user_card_id(post):
        ts = datetime.timestamp(datetime.now())
        post.id = len(pending_verify_users) + 1
        pending_verify_users.append(post.dict())
        return {
            #"data": "pending verification with ref_id: [" + str(post.id) + "] ipd: ["+ post.selected_bank +"] ... less than 1 hour.",
            "ref_id": post.id,
            "card_id": post.card_id,
            "name": post.name,
            "selected_bank": post.selected_bank,
            "ts": ts,
            "status": "accept",
        }
    return { "status": "reject", "data": "User do not exist in NDID database", }

def check_post_user_card_id(data): # posts act as ndid users
    for user in posts:
        if user['card_id'] == data.card_id:
            return True    
    return False

@app.put("/verify/update/{id}", tags=["pending_verify_users"])
async def update_status(id: int, status: str) -> dict:
    if id > len(pending_verify_users):
        return {
            "error": "No such user with the supplied ID."
        }
    print('selected index: ', id)
    
    for user in pending_verify_users:
        if user["id"] == id:
            #pending_verify_users.index(user["id"])
            #print('index had selected ', pending_verify_users.index(user["id"]))
            print('pending_verify_users id: ', pending_verify_users.index(user))
            print('pending_verify_users: ', pending_verify_users[pending_verify_users.index(user)])
            print('pending_verify_users status: ', pending_verify_users[pending_verify_users.index(user)]['status'])
            pending_verify_users[pending_verify_users.index(user)]['status'] = status #'ok'
            return { "id": id, "status": status, }
    return { "error": "User Ref ID did not ever send verify yet" }
# todo ... verify simulation ----------------------------------------------- end #

@app.post("/user/signup", tags=["user"])
async def create_user(user: UserSchema = Body(...)):
    users.append(user) # replace with db call, making sure to hash the password first
    return signJWT(user.email)

def check_user(data: UserLoginSchema):
    for user in users:
        if user.email == data.email and user.password == data.password:
            return True
    return False

@app.post("/user/login", tags=["user"])
async def user_login(user: UserLoginSchema = Body(...)):
    if check_user(user):
        return signJWT(user.email)
    return {
        "error": "Wrong login details!"
    }

# todo ... UAT simulation ----------------------------------------------- start #
idps = [{"identifier": 4859473506827,                         # id card
         "content": [
            {
                "id": "D1F1532B-19AF-4A88-86AC-79693EC158C1", # idp uuid
                "display_name": "Mock 1",                     # idp name
                "display_name_th": "ทดสอบ 1",
                "node_name": {
                "industry_code": "991",
                "company_code": "991",
                "marketing_name_th": "ทดสอบ 1",
                "marketing_name_en": "Mock 1",
                "proxy_or_subsidiary_name_th": "",
                "proxy_or_subsidiary_name_en": "",
                "role": "IDP",
                "running": "1"
                },
                "agent": "false",
                "on_the_fly_support": True,
                "start_service_time": None,
                "end_service_time": None
            },
            {
                "id": "0F5A378A-FF19-4C00-A549-EA208A1C120A",
                "display_name": "Siam Commercial Bank (SCB)",
                "display_name_th": "ธนาคารไทยพาณิชย์",
                "node_name": {
                "industry_code": "001",
                "company_code": "014",
                "marketing_name_th": "ธนาคารไทยพาณิชย์",
                "marketing_name_en": "Siam Commercial Bank (SCB)",
                "proxy_or_subsidiary_name_th": "",
                "proxy_or_subsidiary_name_en": "",
                "role": "IDP",
                "running": "1"
                },
                "agent": "false",
                "on_the_fly_support": True,
                "start_service_time": None,
                "end_service_time": None
            }
         ]
        },
        {"identifier": 3334445556667,                         # id card
         "content": [
            {
                "id": "D3443131-514B-427F-98B7-B772691D8DD9", # idp uuid
                "display_name": "Kiatnakin Phatra Bank",      # idp name
                "display_name_th": "ธนาคารเกียรตินาคิน",
                "node_name": {
                "industry_code": "991",
                "company_code": "991",
                "marketing_name_th": "ธนาคารเกียรตินาคิน",
                "marketing_name_en": "KPB",
                "proxy_or_subsidiary_name_th": "",
                "proxy_or_subsidiary_name_en": "",
                "role": "IDP",
                "running": "1"
                },
                "agent": "false",
                "on_the_fly_support": True,
                "start_service_time": None,
                "end_service_time": None
            },
            {
                "id": "41D9EF13-115D-47A2-81AA-E1DE1FFD654D",
                "display_name": "Bangkok Bank",
                "display_name_th": "ธนาคารกรุงเทพ",
                "node_name": {
                "industry_code": "001",
                "company_code": "014",
                "marketing_name_th": "ธนาคารกรุงเทพ",
                "marketing_name_en": "BBL",
                "proxy_or_subsidiary_name_th": "",
                "proxy_or_subsidiary_name_en": "",
                "role": "IDP",
                "running": "1"
                },
                "agent": "false",
                "on_the_fly_support": True,
                "start_service_time": None,
                "end_service_time": None
            }
         ]
        },
      ]

verify_respones = [{"identifier": 3334445556667, 
                    "content": 
                        {
                        "reference_id": "11111111-a1c0-45fa-b24f-f629bb8cb0ec",
                        "ndid_request_id": "aaaaba53fedc83f490c44bf602eec7b2a1a2034a96d710dc203d22354219a567",
                        "request_timeout": 3600
                        }
                   },
                   {"identifier": 4859473506827, 
                    "content": 
                        {
                        "reference_id": "22222222-0409-11ed-b939-0242ac120002",
                        "ndid_request_id": "bbbbba53fedc83f490c44bf602eec7b2a1a2034a96d710dc203d22354219a567",
                        "request_timeout": 3600
                        }
                   },
                 ]   

authoritative_source = [
                {
                "node_id": "08EC6CD0-0B53-49BA-936C-CC0FF113F1E6",
                "node_name": {
                "industry_code": "992",
                "company_code": "992",
                "marketing_name_th": "ทดสอบ 2",
                "marketing_name_en": "Mock 2",
                "proxy_or_subsidiary_name_th": "",
                "proxy_or_subsidiary_name_en": "",
                "role": "AS",
                "running": "1"
                },
                "min_ial": 2.3,
                "min_aal": 2.2,
                "supported_namespace_list": [
                "citizen_id"
                ]
            },
            {
                "node_id": "614BC141-6D14-417A-88FD-B314ED149BA5",
                "node_name": {
                "industry_code": "991",
                "company_code": "991",
                "marketing_name_th": "ทดสอบ 1",
                "marketing_name_en": "Mock 1",
                "proxy_or_subsidiary_name_th": "",
                "proxy_or_subsidiary_name_en": "",
                "role": "AS",
                "running": "1"
                },
                "min_ial": 2.3,
                "min_aal": 2.2,
                "supported_namespace_list": [
                "citizen_id"
                ]
            },
            {
                "node_id": "4A57316A-C68D-4902-8999-A1E65BA49DD6",
                "node_name": {
                "industry_code": "001",
                "company_code": "069",
                "marketing_name_th": "ธนาคารเกียรตินาคินภัทร",
                "marketing_name_en": "Kiatnakin Phatra Bank",
                "proxy_or_subsidiary_name_th": "",
                "proxy_or_subsidiary_name_en": "",
                "role": "AS",
                "running": "1"
                },
                "min_ial": 2.3,
                "min_aal": 2.2,
                "supported_namespace_list": [
                "citizen_id"
                ]
            },
            {
                "node_id": "BF3755E6-E246-42BD-9ADB-11F9A8E35CAB",
                "node_name": {
                "industry_code": "001",
                "company_code": "014",
                "marketing_name_th": "ธนาคารไทยพาณิชย์",
                "marketing_name_en": "Siam Commercial Bank (SCB)",
                "proxy_or_subsidiary_name_th": "",
                "proxy_or_subsidiary_name_en": "",
                "role": "AS",
                "running": "1"
                },
                "min_ial": 2.3,
                "min_aal": 2.2,
                "supported_namespace_list": [
                "citizen_id"
                ]
            },
        ] 

check_status_respone = [
            {
                "reference_id": "22222222-0409-11ed-b939-0242ac120002",
                "ndid_request_id": "bbbbba53fedc83f490c44bf602eec7b2a1a2034a96d710dc203d22354219a567",
                "status": "VERIFIED",  # verify status
                "response_list": [
                    {
                    "aal": 2.2,
                    "ial": 2.3,
                    "idp_id": "D1F1532B-19AF-4A88-86AC-79693EC158C1",
                    "status": "accept"
                    }
                ]
            },
            {
                "reference_id": "11111111-a1c0-45fa-b24f-f629bb8cb0ec",
                "ndid_request_id": "aaaaba53fedc83f490c44bf602eec7b2a1a2034a96d710dc203d22354219a567",
                "status": "ACCEPTED",  # verify status
                "response_list": [
                    {
                    "aal": 2.2,
                    "ial": 2.3,
                    "idp_id": "D1F1532B-19AF-4A88-86AC-79693EC158C1",
                    "status": "accept"
                    }
                ]
            },
        ]
  

@app.post("/ndid/idps", dependencies=[Depends(JWTBearer())], tags=["idps"])
async def user_idp_regis(response: Response, post: IdpSchema = Body(...)) -> dict:
    print('idp from body = ', post.identifier)
    print('idp from idps = ', idps[0]["identifier"])
    for idp in idps:
        if idp["identifier"] == post.identifier:
            response.status_code = status.HTTP_202_ACCEPTED
            return idp['content']
    response.status_code = status.HTTP_400_BAD_REQUEST
    return {"error": "identifier do not exist"}

# todo --> post: ndid/as/001.cust_info_001 --> เพื่อนำ node_id ไปใช้ verify
@app.get("/ndid/as/{service_id}", dependencies=[Depends(JWTBearer())], tags=["authoritative_source"])
async def service_provider(response: Response, service_id: str) -> dict:
    print('serice id = ', service_id)
    if service_id == '001.cust_info_001':
        return authoritative_source
    response.status_code = status.HTTP_400_BAD_REQUEST
    return {"error": "somethong wrong"}

@app.post("/ndid/verify/data", dependencies=[Depends(JWTBearer())], tags=["verify_data"])
async def user_verify_ndid(response: Response, post: VerifyDataSchema = Body(...)) -> dict:
    for verify in verify_respones:
        if verify["identifier"] == post.identifier:
            
            for status in check_status_respone:
                if status["reference_id"] == verify["content"]["reference_id"]:
                    check_status_respone[check_status_respone.index(status)]['response_list'] = [{
                        "aal": 2.2,
                        "ial": 2.3,
                        "idp_id": post.idp_id_list[0],
                        "status": "accept"
                    }]
            #response.status_code = status.HTTP_202_ACCEPTED
            return verify["content"] 
    response.status_code = status.HTTP_400_BAD_REQUEST
    return {"error": "somethong wrong"}

@app.get("/ndid/verify/status/{reference_id}", dependencies=[Depends(JWTBearer())], tags=["check_verify_status"])
async def check_verify(reference_id: str) -> dict:
    for status in check_status_respone:
        if status["reference_id"] == reference_id:
            #response.status_code = status.HTTP_202_ACCEPTED
            return status
    #response.status_code = status.HTTP_400_BAD_REQUEST
    return {"error": "somethong wrong"}

@app.put("/ndid/active/status/{reference_id}/{active_status}", tags=["active_verify_status"])
async def active_status(reference_id: str, active_status: str) -> dict:
    for status in check_status_respone:
        if status["reference_id"] == reference_id:
            check_status_respone[check_status_respone.index(status)]['status'] = active_status 
            return check_status_respone[check_status_respone.index(status)]
    return {"active status error": "somethong wrong"}
# todo ... UAT simulation ----------------------------------------------- end #

# todo ... AMLO simulation ----------------------------------------------- start #
@app.post("/amlo/verify", dependencies=[Depends(JWTBearer())], tags=["amlo"])
async def amlo_verify(response: Response, post: CidSchema = Body(...)) -> dict:
    for amlo in amlo_res:
        print('amlo id >>', amlo["identifier"])
        print('amlo post cid >>', post.cid)
        if amlo["identifier"] == post.cid:
            return amlo_res[amlo_res.index(amlo)]['content']
    return {"error": "id donot exist in amlo"}
# todo ... AMLO simulation ----------------------------------------------- end #
