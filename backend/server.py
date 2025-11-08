from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class MedicalInfo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    blood_group: str
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    medications: Optional[str] = None
    emergency_contact_name: str
    emergency_contact_phone: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MedicalInfoCreate(BaseModel):
    name: str
    blood_group: str
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    medications: Optional[str] = None
    emergency_contact_name: str
    emergency_contact_phone: str

class EmergencyContact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    relationship: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmergencyContactCreate(BaseModel):
    name: str
    phone: str
    relationship: str

class SOSAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    latitude: float
    longitude: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "active"

class SOSAlertCreate(BaseModel):
    latitude: float
    longitude: float

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "LifeSaver API is running"}

# Medical Info Routes
@api_router.post("/medical-info", response_model=MedicalInfo)
async def create_medical_info(input: MedicalInfoCreate):
    medical_dict = input.model_dump()
    medical_obj = MedicalInfo(**medical_dict)
    
    doc = medical_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.medical_info.insert_one(doc)
    return medical_obj

@api_router.get("/medical-info", response_model=List[MedicalInfo])
async def get_medical_info():
    medical_infos = await db.medical_info.find({}, {"_id": 0}).to_list(1000)
    
    for info in medical_infos:
        if isinstance(info['created_at'], str):
            info['created_at'] = datetime.fromisoformat(info['created_at'])
    
    return medical_infos

@api_router.get("/medical-info/{info_id}", response_model=MedicalInfo)
async def get_medical_info_by_id(info_id: str):
    info = await db.medical_info.find_one({"id": info_id}, {"_id": 0})
    if not info:
        raise HTTPException(status_code=404, detail="Medical info not found")
    
    if isinstance(info['created_at'], str):
        info['created_at'] = datetime.fromisoformat(info['created_at'])
    
    return info

@api_router.put("/medical-info/{info_id}", response_model=MedicalInfo)
async def update_medical_info(info_id: str, input: MedicalInfoCreate):
    existing = await db.medical_info.find_one({"id": info_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Medical info not found")
    
    update_dict = input.model_dump()
    await db.medical_info.update_one({"id": info_id}, {"$set": update_dict})
    
    updated = await db.medical_info.find_one({"id": info_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return updated

@api_router.delete("/medical-info/{info_id}")
async def delete_medical_info(info_id: str):
    result = await db.medical_info.delete_one({"id": info_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Medical info not found")
    return {"message": "Medical info deleted successfully"}

# Emergency Contacts Routes
@api_router.post("/emergency-contacts", response_model=EmergencyContact)
async def create_emergency_contact(input: EmergencyContactCreate):
    contact_dict = input.model_dump()
    contact_obj = EmergencyContact(**contact_dict)
    
    doc = contact_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.emergency_contacts.insert_one(doc)
    return contact_obj

@api_router.get("/emergency-contacts", response_model=List[EmergencyContact])
async def get_emergency_contacts():
    contacts = await db.emergency_contacts.find({}, {"_id": 0}).to_list(1000)
    
    for contact in contacts:
        if isinstance(contact['created_at'], str):
            contact['created_at'] = datetime.fromisoformat(contact['created_at'])
    
    return contacts

@api_router.delete("/emergency-contacts/{contact_id}")
async def delete_emergency_contact(contact_id: str):
    result = await db.emergency_contacts.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact deleted successfully"}

# SOS Alert Routes
@api_router.post("/sos-alert", response_model=SOSAlert)
async def create_sos_alert(input: SOSAlertCreate):
    alert_dict = input.model_dump()
    alert_obj = SOSAlert(**alert_dict)
    
    doc = alert_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.sos_alerts.insert_one(doc)
    return alert_obj

@api_router.get("/sos-alerts", response_model=List[SOSAlert])
async def get_sos_alerts():
    alerts = await db.sos_alerts.find({}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    
    for alert in alerts:
        if isinstance(alert['timestamp'], str):
            alert['timestamp'] = datetime.fromisoformat(alert['timestamp'])
    
    return alerts

# AI Chat Route
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(input: ChatMessage):
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id="lifesaver-emergency",
            system_message="You are LifeSaver AI, a calm and expert emergency responder. When the user describes a situation, give short, clear, step-by-step instructions. Be compassionate, precise, and safety-focused. Keep responses concise and actionable."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=input.message)
        response = await chat.send_message(user_message)
        
        return ChatResponse(response=response)
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()