'use strict';

(function registerCourseSourceDocuments(global) {
  const sources = {
    ctfl: {
      documents: [
        ['1xSjhkFjBocRnRC76CLfLeGqyNhE8y6kH', 'ISTQB CTFL Syllabus v4.0.1 EN', 'syllabus'],
        ['1-qwl2o71ajNYNv96BIHM1-8JC5nnxBVq', 'ISTQB CTFL Syllabus v4.0 ES', 'syllabus'],
        ['1BjVeDvurSRQZqSLPjzDE1C27S7va6BF4', 'ISTQB Exam Structure Tables v1.16', 'exam-structure'],
        ['15pWWch6xMsJALQOx4jSDxZQaVzR236kT', 'ISTQB Exam Structures and Rules v1.2', 'exam-rules'],
        ['1IVUaqzOcym-8JBczil8TktIhmDR3AH5Z', 'ISTQB Exam Structure Tables v1.16, copia de referencia', 'duplicate-reference'],
        ['1I04wKVx_BBGbmaALxwPpm81Z8fAtz_FQ', 'ISTQB Exam Structures and Rules v1.2, copia de referencia', 'duplicate-reference'],
        ['1Qkc1I3gjTRdGlIYGDlxXXMwv0ifeQ_mz', 'CTFL Sample Exam A v1.0 respuestas ES', 'supplemental-answers'],
        ['1atEayGOxXoX74B_aCnVsWagZlE-48fex', 'CTFL modelo A V001.00 respuestas ES', 'supplemental-answers'],
        ['1_ApsuJ6D73QGMGIN1vrXuz2Wn2izI8nq', 'ISTQB Fundamentos', 'supplemental']
      ],
      questionReferences: [
        ['ctfl-a-1.7', '1mUbOlnb2IaE3WsZGzsNiS4lgvQPvQgcF', '1W-7CZ7fbMAHo0vcVn_Nm4d1GKZkO9RXH', 'Sample Exam A v1.7'],
        ['ctfl-b-1.7', '11oT3Jz7PeNbCf3rNwFvMPrDjuj0EWY4z', '1ryhlOrOC6iA5SS8Kv_AUZuah8tv-_aWh', 'Sample Exam B v1.7'],
        ['ctfl-c-1.6', '1p2PkepglheIom5GOUXdn6yZ8ECSbTqFG', '1XfUoViifeBFQ1eXVeccP98tuxbBokLhg', 'Sample Exam C v1.6'],
        ['ctfl-d-1.5', '1kaB40_LmBcLlEeONCC_GMEWA1GX7gmfb', '1N9D7oTARUby3or801N4WxFgQNlUivTiu', 'Sample Exam D v1.5'],
        ['ctfl-gtb-a-2.1', '1OxVSWOr-RLJBMjTI7EpcdBurIiZsvCbe', '1bH5Wo5eLUfNxU1S4B7fKyggmjf8Nu0Rk', 'GTB Sample Exam A v2.1'],
        ['ctfl-gtb-b-1.3.2', '13zxlq3bw5qtsG2IXHxBfww0zXRk71o3O', '1l72cuTVmHUoVwWgFSvsLS1myznJLrMZ-', 'GTB Sample Exam B v1.3.2'],
        ['ctfl-gtb-e-1.2', '1bP5Wsy7dv9xSksbzDUWK1YhXr1BzME5Z', '1XQ9sr70iFlr3XZYeYEi4QGh5G9P65Sf5', 'GTB Sample Exam E v1.2'],
        ['ctfl-gtb-f-1.1', '1-7g5adNLVkyAaobFMW9hKiOMpQ5_FZvW', '1FQQVWAENN-oy-YwZ1hKvWiK5l5LSmGMU', 'GTB Sample Exam F v1.1']
      ]
    },
    ctai: {
      documents: [
        ['169IwP1GK6Yg_HCeh0cWAMfw7TEvpB_Gx', 'ISTQB CT-AI Syllabus v2.0', 'syllabus'],
        ['11QG9hwJrJdB7iOeDw3D--L_GzZIycjnQ', 'ISTQB CT-AI v2.0 Release', 'release-notes'],
        ['1fLgcs3vboA21rGnxH_6-vfU2g0_TowJr', 'ISTQB Exam Structure Tables v1.18', 'exam-structure'],
        ['15ayred4fAkwkafmd_4NUF8saHyFAOArj', 'ISTQB Exam Structure Tables v1.16', 'historical-exam-structure'],
        ['1u-wKkF8O9NR3GN2eN-lRQJqP-022f0Sq', 'ISTQB Exam Structures and Rules v1.2', 'exam-rules'],
        ['1u71Vzzef_LJ97nie5PsPoPsHMrRlYc_9', 'ISTQB CT-AI Accreditation Guidelines', 'supplemental']
      ],
      questionReferences: [
        ['ctai-sample-2.0', '13EhdpGHwBdqJaKyKE4GzI-y8MrS7UuKs', '1XCQz8CH0T0wIHqtVi075SR7SISYSYyCd', 'CT-AI Sample Exam v2.0'],
        ['ctai-sample-2.1', '12dXlYOqLqd3sgm6XjtwJo_cmCWdKiiC3', '11gRt5UdO-g-_4P9GKPl27BN8aMBK-0fa', 'CT-AI Sample Exam v2.1']
      ],
      excludedDocuments: [
        ['1Z2XOxEjm5Shwtpy1hbRZXquB7zUGDE9A', 'CT-GenAI Sample Exam A v1.0', 'Pertenece a ct-genai y no puede alimentar CT-AI.']
      ]
    },
    'ct-genai': {
      documents: [
        ['1lhje30x7IIc3gee_1hUVIVXv65x6Ndjs', 'ISTQB CT-GenAI Syllabus v1.1', 'syllabus'],
        ['1BOAcIXWdd-yE5Lm3-o0iZpvKCj7BulaT', 'ISTQB CT-GenAI v1.1 Release Notes', 'release-notes'],
        ['15mtzdDCzZ_LaSyetmBChTl81A98ukFWi', 'ISTQB CT-GenAI Syllabus v1.0 EN', 'historical-syllabus'],
        ['1iD965lQQEqtxEIkEvCYFjIbA60V9xObR', 'ISTQB CT-GenAI Syllabus v1.0 ES', 'historical-syllabus'],
        ['1BUH0MAAzc2Aw2j1qlBqubD_JDjoNKk4S', 'ISTQB CT-GenAI Syllabus v1.0 ES, copia de referencia', 'duplicate-reference'],
        ['19UH61s0AJbfodjIKIZDtu8Nv3RnbcWPV', 'CT-GenAI Sample Exam A v1.0 respuestas EN', 'supplemental-answers'],
        ['1CDn_aYKmYCybotSyshu9BQtSuKwIbI6i', 'ISTQB Exam Structure Tables v1.18', 'exam-structure'],
        ['1ZOVMFsQQy-rhdR-Nv0QHAiYXvsWaNY5L', 'ISTQB Exam Structures and Rules v1.2', 'exam-rules']
      ],
      questionReferences: [
        ['ct-genai-a-1.0', '1oP3fKXrhhuW2ccpkvRI4SCCSVZQp9YaH', '1_9PDV_adYurzL9QeC5wSswq1j0AFCxMD', 'CT-GenAI Sample Exam A v1.0'],
        ['ct-genai-a-1.1', '1OitcsRxhzVqWABxnCHdqbnz_YuEpG_mT', '1gxSB00kTyAHdXfqB-ZL2GawtDiDKp62J', 'CT-GenAI Sample Exam A v1.1']
      ]
    },
    'scrum-master': {
      documents: [
        ['scrum-guide-2020', 'The Scrum Guide 2020', 'syllabus']
      ],
      questionReferences: [
        ['scrum-guide-2020', 'scrum-guide-2020', 'scrum-guide-2020', 'Scrum Guide 2020']
      ]
    },
    'scrum-product-owner': {
      documents: [
        ['guia-product-owner', 'Guía Product Owner', 'syllabus'],
        ['europeanscrum-product-owner-2025', 'Guía oficial Product Owner 2025 v1.0', 'syllabus']
      ],
      questionReferences: [
        ['product-owner-guides', 'guia-product-owner', 'europeanscrum-product-owner-2025', 'Guías Product Owner']
      ]
    },
    'project-management-essentials': {
      documents: [
        ['1BC2PBW4W0vTPHC_WCw2-UqU6Yx6gCDBR', 'Project Management Essentials', 'syllabus']
      ],
      questionReferences: [
        ['pme-main', '1BC2PBW4W0vTPHC_WCw2-UqU6Yx6gCDBR', '1BC2PBW4W0vTPHC_WCw2-UqU6Yx6gCDBR', 'Project Management Essentials']
      ]
    },
    'scrum-fundamentals': {
      documents: [
        ['1pr-vtKB4izyVIY6UDVNSE_VhZb2a9aNp', 'Scrum Fundamentals', 'syllabus']
      ],
      questionReferences: [
        ['scrum-fundamentals-main', '1pr-vtKB4izyVIY6UDVNSE_VhZb2a9aNp', '1pr-vtKB4izyVIY6UDVNSE_VhZb2a9aNp', 'Scrum Fundamentals']
      ]
    },
    'cybersecurity-awareness': {
      documents: [
        ['1X4ONJELlhnc-81rhRtUCvS3R7amcC22w', 'Cybersecurity Awareness', 'syllabus']
      ],
      questionReferences: [
        ['cybersecurity-main', '1X4ONJELlhnc-81rhRtUCvS3R7amcC22w', '1X4ONJELlhnc-81rhRtUCvS3R7amcC22w', 'Cybersecurity Awareness']
      ]
    },
    pci: {
      documents: [
        ['1H-Vk3TqgGtsL1lauyylRjMQ9YCWKhNbI', 'Fundamentos PCI 2024', 'syllabus']
      ],
      questionReferences: [
        ['pci-exam', '1xeL9mbp3U0noGvOJrNhqA7F7jzfbQEvf', '1xeL9mbp3U0noGvOJrNhqA7F7jzfbQEvf', 'Examen Fundamentos PCI']
      ]
    }
  };

  const normalized = Object.fromEntries(Object.entries(sources).map(([courseKey, scope]) => [
    courseKey,
    Object.freeze({
      courseKey,
      documents: Object.freeze(scope.documents.map(([id, title, kind]) => Object.freeze({ id, title, kind }))),
      questionReferences: Object.freeze(scope.questionReferences.map(([id, questionsId, answersId, title]) => Object.freeze({
        id,
        questionsId,
        answersId,
        title
      }))),
      excludedDocuments: Object.freeze((scope.excludedDocuments || []).map(([id, title, reason]) => Object.freeze({ id, title, reason })))
    })
  ]));

  global.ACADEMY_COURSE_SOURCES = Object.freeze(normalized);
}(window));
