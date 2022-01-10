from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import db_helper
import uvicorn
import const


class Student(BaseModel):
    id: int = None
    last_name: str
    first_name: str
    middle_name: str
    city: str
    study: str
    avatar: str
    phone_number: str
    email: str
    


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/students")
def students_list():
    """
    Получение списка студентов
    """
    sql = """
        select
            id,
            last_name,
            first_name,
            middle_name,
            city,
            study,
            avatar,
            phone_number,
            email
        from tenzor_students
        order by last_name
    """
    return db_helper.execute_query(sql)

@app.put('/stundents/{id}')
def update(id: int, payload: Student):
    """
    Обновление карточки студента
    """
    sql = """
        update tenzor_students
        set 
            last_name = %s::text,
            first_name = %s::text,
            middle_name = %s::text,
            city = %s::text,
            study = %s::text,
            avatar = %s::text,
            phone_number = %s::text,
            email = %s::text
        where id = %s::int
    """
    print('put: ', sql)
    db_helper.execute_query(
        sql,
        payload.last_name,
        payload.first_name,
        payload.middle_name,
        payload.city,
        payload.study,
        payload.avatar,
        payload.phone_number,
        payload.email
    )


@app.post('/students')
def create(payload: Student):
    """
    Создание карточки студента
    """
    sql = """
        insert into tenzor_students (last_name, first_name, middle_name, city, study, avatar, phone_number, email)
        values (%s::text, %s::text, %s::text, %s::text, %s::text, %s::text, %s::text, %s::text)
    """
    db_helper.execute_query(
        sql,
        payload.last_name,
        payload.first_name,
        payload.middle_name,
        payload.city,
        payload.study,
        payload.avatar,
        payload.phone_number,
        payload.email
    )
    

@app.delete('/students/{id}')
def delete(id: int):
    """
    Удаление карточки студента
    """
    sql = """
        delete from tenzor_students where id = %s::int
    """
    db_helper.execute_query(sql, id)


if __name__ == '__main__':
    uvicorn.run(app, host=const.APP_IP, port=const.APP_PORT)