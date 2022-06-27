from fastapi import FastAPI, Body, Depends

from app.model import PostSchema, UserSchema, UserLoginSchema, VerifySchema
from app.auth.auth_bearer import JWTBearer
from app.auth.auth_handler import signJWT


posts = [
    {
        "id": 1,
        "card_id": 4444449999999,
        "name": "Pancake",
        "content": ["scb", "ktb", "kkp"]
    },
    {
        "id": 2,
        "card_id": 1234599999999,
        "name": "Apple",
        "content": ["bbc", "kbank"]
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
]

users = []

app = FastAPI()


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

# todo ... verify simulation
@app.post("/verify", dependencies=[Depends(JWTBearer())], tags=["posts"])
async def bank_verify(post: VerifySchema) -> dict:
    # Todo ... pending time (< 1h)
    post.id = len(pending_verify_users) + 1
    pending_verify_users.append(post.dict())
    return {
        "data": "pending verification with ["+ post.selected_bank +"] ... less than 1 hour"
    }

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