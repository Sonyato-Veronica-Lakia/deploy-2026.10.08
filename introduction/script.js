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
// 2. 소환 컨펌, 타이머 로딩 스피너 및 마력 정산 보존 시스템
// ==========================================

let summonCount = 1234;
let totalRevenue = 5123120;
let summonLogs = JSON.parse(localStorage.getItem('summonLogs')) || [];

const countDisplay = document.getElementById('total-summons');
const revenueDisplay = document.getElementById('total-revenue');
const buyButtons = document.querySelectorAll('.btn-buy');
const logList = document.getElementById('log-list');

// 커스텀 모달 노드 제어
const customAlert = document.getElementById('custom-alert');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');

const customConfirm = document.getElementById('custom-confirm');
const logClearBtn = document.getElementById('log-clear-btn');
const confirmYesBtn = document.getElementById('confirm-yes-btn');
const confirmNoBtn = document.getElementById('confirm-no-btn');

// 🔮 [새로 추가] 소환 프로세스 전용 모달 및 스피너 노드 제어
const summonConfirmModal = document.getElementById('summon-confirm-modal');
const summonConfirmMessage = document.getElementById('summon-confirm-message');
const summonYesBtn = document.getElementById('summon-yes-btn');
const summonNoBtn = document.getElementById('summon-no-btn');
const magicSpinner = document.getElementById('magic-spinner');

// 임시 보관용 타겟 변수
let currentTargetCard = null;

function renderLogs() {
  logList.innerHTML = '';
  if (summonLogs.length === 0) {
    logList.innerHTML = `<li class="log-item empty-msg">아직 기록된 소환 의식이 없습니다.</li>`;
    return;
  }
  summonLogs.forEach((log, index) => {
    const li = document.createElement('li');
    li.className = 'log-item';
    li.innerHTML = `
      <span>✨ [${log.title}] 요정이 현실 세계로 소환되었습니다.</span>
      <div>
        <span class="log-time">${log.time}</span>
        <button class="log-delete-btn" onclick="deleteSingleLog(${index})">✕</button>
      </div>
    `;
    logList.appendChild(li);
  });
}

window.deleteSingleLog = function(index) {
  summonLogs.splice(index, 1);
  localStorage.setItem('summonLogs', JSON.stringify(summonLogs));
  renderLogs();
};

// [소환하기] 버튼을 눌렀을 때 프로세스 시작
buyButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    currentTargetCard = e.target.closest('.box');
    const title = currentTargetCard.querySelector('.box-title').textContent;
    const price = parseInt(currentTargetCard.getAttribute('data-price'), 10);

    // 🔮 1단계: 바로 소환하지 않고, 가격을 명시하여 소환 여부를 묻는 전용 팝업 로드
    summonConfirmMessage.innerHTML = `진짜로 <strong>[${title}]</strong> 요정을 소환하시겠습니까?<br><span style="color: #e0b0ff; font-size: 14px;">(소모 마력: ${price.toLocaleString()} MP)</span>`;
    summonConfirmModal.style.display = 'flex';
  });
});

// 소환 컨펌창에서 [소환]을 수락했을 때
summonYesBtn.addEventListener('click', () => {
  if (!currentTargetCard) return;
  
  // 가격 확인 모달창 닫기
  summonConfirmModal.style.display = 'none';

  // 🔮 2단계: 신비로운 마법진 로딩 스피너 즉시 가동
  magicSpinner.style.display = 'flex';

  // 🔮 3단계: 정확히 2초(2000ms) 지연 타이머 세팅 후 콜백 실행
  setTimeout(() => {
    // 2초 뒤 스피너 제거
    magicSpinner.style.display = 'none';

    // 최종 데이터 처리 단계 진입
    const title = currentTargetCard.querySelector('.box-title').textContent;
    const price = parseInt(currentTargetCard.getAttribute('data-price'), 10);

    summonCount += 1;
    totalRevenue += price;

    countDisplay.textContent = `${summonCount.toLocaleString()}회 소환됨`;
    revenueDisplay.textContent = `${totalRevenue.toLocaleString()} MP`;

    // 영구 완료 알림 팝업 전개
    modalMessage.textContent = `[${title}] 요정 소환에 성공했습니다!\n(${price.toLocaleString()} MP 소모)`;
    customAlert.style.display = 'flex';

    // 시간 연산
    const now = new Date();
    const timeString = `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, '0')}월 ${String(now.getDate()).padStart(2, '0')}일 ${String(now.getHours()).padStart(2, '0')}시 ${String(now.getMinutes()).padStart(2, '0')}분 ${String(now.getSeconds()).padStart(2, '0')}초`;

    // 히스토리 보존 및 반영
    summonLogs.unshift({ title: title, time: timeString });
    localStorage.setItem('summonLogs', JSON.stringify(summonLogs));
    renderLogs();

    // 초기화
    currentTargetCard = null;
  }, 2000);
});

// 소환 컨펌창에서 [취소]를 선택했을 때
summonNoBtn.addEventListener('click', () => {
  summonConfirmModal.style.display = 'none';
  currentTargetCard = null;
});

// 대시보드 로그 초기화 기믹
logClearBtn.addEventListener('click', () => { customConfirm.style.display = 'flex'; });
confirmYesBtn.addEventListener('click', () => {
  summonLogs = [];
  localStorage.removeItem('summonLogs');
  renderLogs();
  customConfirm.style.display = 'none';
});
confirmNoBtn.addEventListener('click', () => { customConfirm.style.display = 'none'; });

modalCloseBtn.addEventListener('click', () => { customAlert.style.display = 'none'; });
customAlert.addEventListener('click', (e) => { if (e.target === customAlert) customAlert.style.display = 'none'; });
customConfirm.addEventListener('click', (e) => { if (e.target === customConfirm) customConfirm.style.display = 'none'; });
summonConfirmModal.addEventListener('click', (e) => { if (e.target === summonConfirmModal) summonConfirmModal.style.display = 'none'; });

// 초기 로딩 데이터 표시
renderLogs();
