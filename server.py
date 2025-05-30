import os
import qrcode
import requests
from flask import Flask, request, jsonify, send_from_directory
from datetime import datetime

app = Flask(__name__)

QR_FOLDER = "/Users/suhyeon/Documents/code/qr_codes"
os.makedirs(QR_FOLDER, exist_ok=True)

# 외부 급식 API URL과 API 키 (본인 API 키로 교체)
MEAL_API_URL = "https://open.neis.go.kr/hub/mealServiceDietInfo"
MEAL_API_KEY = "368ccd7447b04140b197c937a072fb76"
ATPT_OFCDC_SC_CODE = "T10"   # 교육청 코드 (예: 서울특별시)
SD_SCHUL_CODE = "9290055"    # 학교 코드 (본인 학교 코드로 변경)

@app.route('/generate_qr', methods=['POST'])
def generate_qr():
    data = request.get_json()
    grade = str(data.get('grade', '')).strip()
    class_num = str(data.get('class_num', '')).strip()
    student_num = str(data.get('student_num', '')).strip()
    name = str(data.get('name', '')).strip()

    if not (grade.isdigit() and class_num.isdigit() and student_num.isdigit() and name):
        return jsonify({"error": "학년, 반, 번호는 숫자, 이름은 반드시 입력해주세요."}), 400

    filename = f"{grade}_{class_num}_{student_num}.png"
    filepath = os.path.join(QR_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "해당 학생의 QR 코드가 존재하지 않습니다."}), 404

    return jsonify({"qr_code_path": filename})

@app.route('/qr_codes/<path:filename>')
def serve_qr_code(filename):
    return send_from_directory(QR_FOLDER, filename)

@app.route('/meal', methods=['GET'])
def get_meal():
    date_str = request.args.get('date')
    if not date_str:
        date_str = datetime.today().strftime("%Y%m%d")

    params = {
        'KEY': MEAL_API_KEY,
        'Type': 'json',
        'ATPT_OFCDC_SC_CODE': ATPT_OFCDC_SC_CODE,
        'SD_SCHUL_CODE': SD_SCHUL_CODE,
        'MLSV_YMD': date_str
    }

    try:
        response = requests.get(MEAL_API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        meal_info = {'lunch': '정보 없음', 'dinner': '정보 없음'}

        meal_service = data.get('mealServiceDietInfo')
        if meal_service and len(meal_service) > 1:
            meal_data = meal_service[1].get('row', [])
            for meal in meal_data:
                meal_type = meal.get('MMEAL_SC_NM', '')
                dish_name = meal.get('DDISH_NM', '')
                if meal_type == '중식':  # 점심
                    meal_info['lunch'] = dish_name
                elif meal_type == '석식':  # 석식
                    meal_info['dinner'] = dish_name
        else:
            meal_info['error'] = "급식 정보가 없습니다."

        return jsonify(meal_info)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/nutrition', methods=['GET'])
def get_nutrition():
    date_str = request.args.get('date')
    if not date_str:
        date_str = datetime.today().strftime("%Y%m%d")

    params = {
        'KEY': MEAL_API_KEY,
        'Type': 'json',
        'ATPT_OFCDC_SC_CODE': ATPT_OFCDC_SC_CODE,
        'SD_SCHUL_CODE': SD_SCHUL_CODE,
        'MLSV_YMD': date_str
    }

    try:
        response = requests.get(MEAL_API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        meal_service = data.get('mealServiceDietInfo')
        if not meal_service or len(meal_service) < 2:
            return jsonify({"error": "급식 정보가 없습니다."}), 404

        meal_rows = meal_service[1].get('row', [])
        if not meal_rows:
            return jsonify({"error": "급식 정보가 없습니다."}), 404

        orplc_info = []
        cal_info = []
        ntr_info = []
        menu_names = []
        allergy_codes_list = []

        for row in meal_rows:
            orplc = row.get('ORPLC_INFO', '')
            if orplc:
                orplc_info.append(orplc)

            cal = row.get('CAL_INFO', '')
            if cal:
                cal_info.append(cal)

            ntr = row.get('NTR_INFO', '')
            if ntr:
                ntr_info.append(ntr)

            dish_name = row.get('DDISH_NM', '')
            if dish_name:
                menu_names.append(dish_name)

                # 알레르기 번호 추출 (괄호 안 숫자, 구분자는 '.' 또는 ',' 지원)
                start = dish_name.find('(')
                end = dish_name.find(')')
                if start != -1 and end != -1 and start < end:
                    codes_str = dish_name[start+1:end]
                    codes = [code.strip() for code in codes_str.replace(',', '.').split('.')]
                    allergy_codes_list.extend(codes)

        orplc_info_str = ', '.join(sorted(set(orplc_info))) if orplc_info else '정보 없음'
        cal_info_str = ', '.join(sorted(set(cal_info))) if cal_info else '정보 없음'
        ntr_info_str = ', '.join(sorted(set(ntr_info))) if ntr_info else '정보 없음'
        menu_names_str = '\n'.join(menu_names) if menu_names else '정보 없음'

        # 중복 알레르기 번호 합치기 (빈값 제외)
        allergy_codes_list = [code for code in allergy_codes_list if code]
        all_codes_unique = ','.join(sorted(set(allergy_codes_list))) if allergy_codes_list else ''

        return jsonify({
            "ORPLC_INFO": orplc_info_str,
            "CAL_INFO": cal_info_str,
            "NTR_INFO": ntr_info_str,
            "menu_names": menu_names_str,
            "allergy": all_codes_unique
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return jsonify({"message": "서버 정상 실행 중"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)
