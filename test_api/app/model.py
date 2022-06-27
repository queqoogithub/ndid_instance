from pydantic import BaseModel, Field, EmailStr


class PostSchema(BaseModel):
    id: int = Field(default=None)
    card_id: int = Field(...)
    name: str = Field(...)
    content: list = Field(...)

    class Config:
        schema_extra = {
            "example": {
                "card_id": 5555559999999,
                "name": "Jojo",
                "content": ["ktc", "kbank", "bbl", "bay"]
            }
        }

class UserSchema(BaseModel):
    fullname: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)

    class Config:
        schema_extra = {
            "example": {
                "fullname": "Nara Pho",
                "email": "abc@x.com",
                "password": "1234"
            }
        }

class UserLoginSchema(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(...)

    class Config:
        schema_extra = {
            "example": {
                "email": "abc@x.com",
                "password": "1234"
            }
        }

class VerifySchema(BaseModel):
    id: int = Field(default=None)
    card_id: int = Field(...)
    name: str = Field(...)
    selected_bank: str = Field(...)
    status: str = Field('pending')

    class Config:
        schema_extra = {
            "example": {
                "card_id": 1234599999999,
                "name": "Steve",
                "selected_bank": "kbank",
                "status": "pending"
            }
        }