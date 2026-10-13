// ==========================================
// 1. 왼쪽 사이드 메뉴 탭 전환 기능
// ==========================================
const sideLinks = document.querySelectorAll('.side-link');
const tabContents = document.querySelectorAll('.tab-content');

sideLinks.forEach(link => {
  link.addEventListener('click', () => {
    sideLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    tabContents.forEach(content => content.classList.remove('active'));

    const targetId = link.getAttribute('data-target');
    document.getElementById(targetId).classList.add('active');
  });
});


// ==========================================
// 2. 실시간 소환, 마력 매출 연동 및 영구 보존(Local Storage) 로그 시스템
// ==========================================

// 초기 가상 데이터 설정
let summonCount = 1234;
let totalRevenue = 5123120;

// 브라우저 저장소에서 기존에 저장된 로그 목록 가져오기 (없으면 빈 배열)
let summonLogs = JSON.parse(localStorage.getItem('summonLogs')) || [];

// DOM 엘리먼트 가져오기
const countDisplay = document.getElementById('total-summons');
const revenueDisplay = document.getElementById('total-revenue');
const buyButtons = document.querySelectorAll('.btn-buy');
const logList = document.getElementById('log-list');

// 커스텀 모달 알림창(Alert) 엘리먼트
const customAlert = document.getElementById('custom-alert');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');

// 🔮 [새로 추가] 커스텀 확인창(Confirm) 엘리먼트
const customConfirm = document.getElementById('custom-confirm');
const logClearBtn = document.getElementById('log-clear-btn');
const confirmYesBtn = document.getElementById('confirm-yes-btn');
const confirmNoBtn = document.getElementById('confirm-no-btn');

// 🔮 [새로 추가] 페이지가 처음 켜졌을 때 저장되어 있던 로그 화면에 그려주는 함수
function renderLogs() {
  logList.innerHTML = ''; // 기존 리스트 리셋

  if (summonLogs.length === 0) {
    logList.innerHTML = `<li class="log-item empty-msg">아직 기록된 소환 의식이 없습니다.</li>`;
    return;
  }

  // 최신 데이터가 위로 오도록 배열을 토대로 그리기
  summonLogs.forEach((log, index) => {
    const li = document.createElement('li');
    li.className = 'log-item';
    li.innerHTML = `
      <span>✨ [${log.title}] 요정이 현실 세계로 소환되었습니다.</span>
      <div>
        <span class="log-time">${log.time}</span>
        <!-- 🔮 개별 삭제 버튼 (클릭 시 해당 인덱스 파기) -->
        <button class="log-delete-btn" onclick="deleteSingleLog(${index})">✕</button>
      </div>
    `;
    logList.appendChild(li); // 순서대로 추가
  });
}

// 🔮 [새로 추가] 개별 로그 삭제 함수 (전역 범위 호출 가능하게 세팅)
window.deleteSingleLog = function (index) {
  summonLogs.splice(index, 1); // 배열에서 해당 로그 삭제
  localStorage.setItem('summonLogs', JSON.stringify(summonLogs)); // 저장소 동기화
  renderLogs(); // 화면 다시 그리기
};

// 소환하기 버튼 제어
buyButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const card = e.target.closest('.box');
    const title = card.querySelector('.box-title').textContent;
    const price = parseInt(card.getAttribute('data-price'), 10);

    // 데이터 갱신
    summonCount += 1;
    totalRevenue += price;

    countDisplay.textContent = `${summonCount.toLocaleString()}회 소환됨`;
    revenueDisplay.textContent = `${totalRevenue.toLocaleString()} MP`;

    // 알림창 띄우기
    modalMessage.textContent = `[${title}] 요정 소환에 성공했습니다!\n(${price.toLocaleString()} MP 소모)`;
    customAlert.style.display = 'flex';

    // 실시간 날짜 포맷 생성
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${year}년 ${month}월 ${date}일 ${hours}시 ${minutes}분 ${seconds}초`;

    // 🔮 새 로그 객체를 생성하여 배열 최상단(맨 앞)에 추가
    summonLogs.unshift({ title: title, time: timeString });

    // 브라우저 영구 보존소에 데이터 저장
    localStorage.setItem('summonLogs', JSON.stringify(summonLogs));

    // 로그 화면 리렌더링
    renderLogs();
  });
});

// 🔮 [새로 추가] 로그 전체 초기화 메커니즘
logClearBtn.addEventListener('click', () => {
  customConfirm.style.display = 'flex'; // 커스텀 경고창 열기
});

// 초기화 경고창에서 [확인] 누를 시
confirmYesBtn.addEventListener('click', () => {
  summonLogs = []; // 로그 배열 통째로 비우기
  localStorage.removeItem('summonLogs'); // 브라우저 저장소 데이터 삭제
  renderLogs(); // 로그 리스트 초기화 렌더링
  customConfirm.style.display = 'none'; // 창 닫기
});

// 초기화 경고창에서 [취소] 누를 시
confirmNoBtn.addEventListener('click', () => {
  customConfirm.style.display = 'none'; // 그대로 창만 닫기
});

// 알림창(모달) 닫기 이벤트들
modalCloseBtn.addEventListener('click', () => { customAlert.style.display = 'none'; });
customAlert.addEventListener('click', (e) => { if (e.target === customAlert) customAlert.style.display = 'none'; });
customConfirm.addEventListener('click', (e) => { if (e.target === customConfirm) customConfirm.style.display = 'none'; });

// 🔮 앱 시작 시 기존 로그 자동 호출 실행
renderLogs();
