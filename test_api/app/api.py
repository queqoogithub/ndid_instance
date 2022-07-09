from fastapi import FastAPI, Body, Depends

from app.model import PostSchema, UserSchema, UserLoginSchema, VerifySchema
from app.auth.auth_bearer import JWTBearer
from app.auth.auth_handler import signJWT

from datetime import datetime


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