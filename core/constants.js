export const BASE_URL = 'https://app.ntut.edu.tw/';

export const SERVICES = {
    "教務系統": {
        "課程系統": "aa_0010-oauth",
        "北科 i 學園 PLUS": "ischool_plus_oauth",                
        "學業成績查詢": "aa_003_oauth",   //original: 學業成績查詢(二機)
        "新生網路選課 1": "aa_016_oauth",
        "新生網路選課 2": "aa_017_oauth",
        "期中撤選": "aa_Online+Course+Withdrawal+System_stu_oauth",                
        "開學加退選 1": "aa_030_oauth",
        "開學加退選 2": "aa_030_2_oauth",
        "開學加退選 3": "aa_030_3_oauth",        
        "期末網路預選 1": "aa_011_oauth",
        "期末網路預選 2": "aa_012_oauth",        
        "暑修需求登錄": "aa_015_oauth",        
        "期末教學評量 1": "aa_009_oauth",
        "期末教學評量 2": "aa_009_2_oauth",        
        "傑出教學獎票選": "aa_038_oauth",
        "暑修選課繳費單": "aa_029_oauth",
        "畢業生離校系統": "aa-gradu_oauth",
        "家長系統": "aa_ParentSystem_oauth",
        "Easy Test 平台": "aa_easytest_oauth",
        "外語中心資訊系統": "aa_027_oauth",
        "電子大頭照上傳": "aa_StuPhoto_oauth",        
    },    
    "學務系統": {
        "學生查詢專區": "sa_003_oauth",
        "學生請假系統": "sa_010_oauth",
        "學生停車證申請": "sa_005",
        "學生宿舍登錄抽籤": "sa_007_oauth",
        "器材租借系統": "sa_009_oauth",
        "就學貸款申請系統": "sa_SLAS_oauth",
        "英文門檻考試報名": "StuETA_oauth",
        "學生證掛失補發": "ezcard_oauth"
    },
    "其他服務": {
        "圖書館入口": "lib_002_oauth2",
        "獎助學金申請": "NTUT_scholarship_oauth",
        "網路資訊安全管理": "ipmac_oauth",
        "學雜費減免 / 弱勢助學": "NTUT_exemption_oauth",
        "學雜費減免（進修部）": "NTUT_exemption_OCE_oauth",                               
        "電子郵件": "zimbrasso_oauth",
        "北科 VCP AI 平台": "inf_vcp_oauth",
        "校園授權軟體": "inf001_oauth",
        "諮商預約系統": "counseling_oauth",                
        "新學術資源網": "ar_OAUTH",
        "入班輔導活動": "Counselors_Activity_System_oauth",
        "建物與設備維修": "ga_008_oauth",
        "化學物質 GHS 管理": "ga_ghs_oauth",
        "線上繳費系統": "OnlinePayment_oauth",
        "教師評鑑及資料庫": "rd_001_oauth",
        "產學合作資訊系統": "rd_003",
        "研究獎助生申請系統": "rnd-rs-oauth",
        "學術倫理管理系統": "rd_aes_oauth",
        "網路投票系統": "per_001_oauth",
        "小郵差": "test_postman"
    }
};

export const DEFAULT_FAVORITES = [
    "ischool_plus_oauth", "sa_010_oauth", "aa_0010-oauth",
    "sa_003_oauth", "lib_002_oauth2", "zimbrasso_oauth"
];
