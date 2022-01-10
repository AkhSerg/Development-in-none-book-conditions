from psycopg2 import connect, OperationalError, ProgrammingError
from psycopg2.extras import RealDictCursor, RealDictRow
from typing import List
import const

# аннотация типов -> функция возвращает объект connect
def create_connection() -> connect:
    """
    Функция создания подключения к базе данных
    """
    try:
        con = connect(
            database=const.DB_NAME,
            user=const.DB_USER,
            password=const.DB_PASS,
            host=const.DB_HOST,
            port=const.DB_PORT
        )
        con.autocommit = True
    # исключение на случай ошибки
    except OperationalError as e:
        con = None
        print(f"Error: {e}")
    return con

def execute_query(query: str, *args) -> List[dict]:
    """
    Функция для выполненния запросов к базе данных
    """
    print(query, args)
    con = create_connection()
    if not con:
        return None
    # получаем данные из соединения: реструктурируем кортежи на словари, тогда fetchall() вернет список словарей (поле: значение)
    cursor = con.cursor(cursor_factory=RealDictCursor)
    try:
        # выполняем запрос
        cursor.execute(query, args)
        # получаем данные из запроса: fetchall() - список кортежей; fetchone() - первый кортеж
        result = cursor.fetchall()
    # # исключение при поптыке взять данные
    except ProgrammingError as e:
        result = None
        print(e)
    except OperationalError as e:
        print(f"Error: {e}")
        result = None
    finally:
        con.close()
    return result

# first_name = 'Мария 222'
# sql = """
#     select * from student
# """
# update student set first_name = %s
# res = execute_query(sql)

# res = execute_query(sql)
# print(res)