#from numpy import _2Tuple
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

# todo ... UAT simulation ----------------------------------------------- start #
class IdpSchema(BaseModel):
    min_aal: float = Field(default=2.2)
    min_ial: float = Field(default=2.3)
    namespace: str = Field(default="citizen_id")
    identifier: int = Field(...)
    on_the_fly_support: bool = Field(default=True)

    class Config:
        schema_extra = {
            "example": {
                    "min_aal": 2.2,
                    "min_ial": 2.3,
                    "namespace": "citizen_id",
                    "identifier": "4859473506827",
                    "on_the_fly_support": True
            }
        }

class VerifyDataSchema(BaseModel):
    namespace: str = Field(default="citizen_id")
    identifier: int = Field(...)
    request_message: str = Field(default="123456")
    idp_id_list: list = Field(...)
    min_idp: int = Field(default=1)
    min_aal: int = Field(default=2.2)
    min_ial: int = Field(default=2.3)
    mode: int = Field(default=2)
    bypass_identity_check: bool = Field(default=False)
    request_timeout: int = Field(default=3600)
    data_request_list: list = Field(...)

    class Config:
        schema_extra = {
            "example": {
                    "namespace": "citizen_id",
                    "identifier": "4859473506827",
                    "request_message": "12345678",
                    "idp_id_list": [
                        "D1F1532B-19AF-4A88-86AC-79693EC158C1"
                    ],
                    "min_idp": 1,
                    "min_aal": 2.2,
                    "min_ial": 2.3,
                    "mode": 2,
                    "bypass_identity_check": False,
                    "request_timeout": 3600,
                    "data_request_list": [
                        {
                        "service_id": "001.cust_info_001",
                        "as_id_list": [
                            "614BC141-6D14-417A-88FD-B314ED149BA5"
                        ],
                        "min_as": 1,
                        "request_params": ""
                        }
                    ]
            }
        }

# todo ... UAT simulation ----------------------------------------------- end #

