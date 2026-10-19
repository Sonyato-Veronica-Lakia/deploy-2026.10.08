// ==========================================================================
// 🔮 1. 왼쪽 사이드 메뉴 탭 전환 및 연동 기능
// ==========================================================================
const sideLinks = document.querySelectorAll('.side-link');
const tabContents = document.querySelectorAll('.tab-content');

sideLinks.forEach(link => {
  link.addEventListener('click', () => {
    sideLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    tabContents.forEach(content => content.classList.remove('active'));

    const targetId = link.getAttribute('data-target');
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.classList.add('active');
    }
  });
});

// ==========================================================================
// 🔮 2. 소환 컨펌, 타이머 로딩 스피너 및 마력 정산 보존 시스템
// ==========================================================================
let summonCount = parseInt(localStorage.getItem('summonCount'), 10) || 1234;
let totalRevenue = parseInt(localStorage.getItem('totalRevenue'), 10) || 5123120;
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

// 소환 프로세스 전용 모달 및 스피너 노드 제어
const summonConfirmModal = document.getElementById('summon-confirm-modal');
const summonConfirmMessage = document.getElementById('summon-confirm-message');
const summonYesBtn = document.getElementById('summon-yes-btn');
const summonNoBtn = document.getElementById('summon-no-btn');
const magicSpinner = document.getElementById('magic-spinner');

// 임시 보관용 타겟 변수
let currentTargetCard = null;

// 초기 데이터 화면에 세팅
if (countDisplay) countDisplay.textContent = `${summonCount.toLocaleString()}회 소환됨`;
if (revenueDisplay) revenueDisplay.textContent = `${totalRevenue.toLocaleString()} MP`;

function renderLogs() {
  if (!logList) return;
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

window.deleteSingleLog = function (index) {
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

    if (summonConfirmMessage && summonConfirmModal) {
      summonConfirmMessage.innerHTML = `진짜로 <strong>[${title}]</strong> 요정을 소환하시겠습니까?<br><span style="color: #e0b0ff; font-size: 14px;">(소모 마력: ${price.toLocaleString()} MP)</span>`;
      summonConfirmModal.style.display = 'flex';
    }
  });
});

// 소환 컨펌창에서 [소환]을 수락했을 때
if (summonYesBtn) {
  summonYesBtn.addEventListener('click', () => {
    if (!currentTargetCard) return;

    if (summonConfirmModal) summonConfirmModal.style.display = 'none';
    if (magicSpinner) magicSpinner.style.display = 'flex';

    setTimeout(() => {
      if (magicSpinner) magicSpinner.style.display = 'none';

      const title = currentTargetCard.querySelector('.box-title').textContent;
      const price = parseInt(currentTargetCard.getAttribute('data-price'), 10);

      summonCount += 1;
      totalRevenue += price;

      localStorage.setItem('summonCount', summonCount);
      localStorage.setItem('totalRevenue', totalRevenue);

      if (countDisplay) countDisplay.textContent = `${summonCount.toLocaleString()}회 소환됨`;
      if (revenueDisplay) revenueDisplay.textContent = `${totalRevenue.toLocaleString()} MP`;

      if (modalMessage && customAlert) {
        modalMessage.textContent = `[${title}] 요정 소환에 성공했습니다!\n(${price.toLocaleString()} MP 소모)`;
        customAlert.style.display = 'flex';
      }

      const now = new Date();
      const timeString = `${now.getFullYear()}년 ${String(now.getMonth() + 1).padStart(2, '0')}월 ${String(now.getDate()).padStart(2, '0')}일 ${String(now.getHours()).padStart(2, '0')}시 ${String(now.getMinutes()).padStart(2, '0')}분 ${String(now.getSeconds()).padStart(2, '0')}초`;

      summonLogs.unshift({ title: title, time: timeString });
      localStorage.setItem('summonLogs', JSON.stringify(summonLogs));
      renderLogs();

      currentTargetCard = null;
    }, 2000);
  });
}

// 소환 컨펌창에서 [취소]를 선택했을 때
if (summonNoBtn) {
  summonNoBtn.addEventListener('click', () => {
    if (summonConfirmModal) summonConfirmModal.style.display = 'none';
    currentTargetCard = null;
  });
}

// 대시보드 로그 초기화 기믹
if (logClearBtn) logClearBtn.addEventListener('click', () => { if (customConfirm) customConfirm.style.display = 'flex'; });
if (confirmYesBtn) {
  confirmYesBtn.addEventListener('click', () => {
    summonLogs = [];
    localStorage.removeItem('summonLogs');
    renderLogs();
    if (customConfirm) customConfirm.style.display = 'none';
  });
}
if (confirmNoBtn) {
  confirmNoBtn.addEventListener('click', () => {
    if (customConfirm) customConfirm.style.display = 'none';
  });
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', () => {
    if (customAlert) customAlert.style.display = 'none';
  });
}

// 바깥 영역 클릭 시 모달 닫기 예외 처리
if (customAlert) customAlert.addEventListener('click', (e) => { if (e.target === customAlert) customAlert.style.display = 'none'; });
if (customConfirm) customConfirm.addEventListener('click', (e) => { if (e.target === customConfirm) customConfirm.style.display = 'none'; });
if (summonConfirmModal) summonConfirmModal.addEventListener('click', (e) => { if (e.target === summonConfirmModal) summonConfirmModal.style.display = 'none'; });

// 초기 로그 렌더링 호출
renderLogs();

// ==========================================================================
// 🔮 3. 로그인 상태 세션 관리 및 대시보드 신규 가입 마법사 수 연동
// ==========================================================================
document.addEventListener("DOMContentLoaded", function() {
  
  if (sessionStorage.getItem('loginUser') == null) {
    alert("🔮 시스템 예언: 먼저 마법 계약(로그인)을 맺으십시오.");
    location.href = "login.html"; // 로그인 안 했으면 로그인 창으로 튕김
    return;
  }
  
  const loginToggleBtn = document.getElementById('login-toggle-btn');
  const listLink = document.getElementById('list-link');
  const mypageLink = document.getElementById('mypage-link');
  
  // 가입된 마법사 데이터 로드 및 '신규 계약 마법사' 위젯 수치 자동 갱신
  const wizardAccounts = JSON.parse(localStorage.getItem('wizardAccounts')) || [];
  const widgets = document.querySelectorAll('.widget');
  
  widgets.forEach(widget => {
    const title = widget.querySelector('.widget-title');
    if (title && title.textContent.includes('신규 계약 마법사')) {
      const wordDiv = widget.querySelector('.word');
      if (wordDiv) {
        wordDiv.textContent = `${wizardAccounts.length}명 계약됨`;
      }
    }
  });

  // 현재 브라우저 세션에 로그인한 마법사 ID가 있는지 판별
  const loginUser = sessionStorage.getItem('loginUser'); 

  const loginUserName = sessionStorage.getItem('loginUserName') || loginUser; 

  if (!loginUser) {
    // 🔓 [비로그인 상태 프로토콜]
    if (loginToggleBtn) loginToggleBtn.textContent = "Login";
    
    // 접근 제한 스타일(보라 안개) 부여
    if (listLink) listLink.classList.add('disabled-link');
    if (mypageLink) mypageLink.classList.add('disabled-link');

    // 비로그인 시 클릭 차단 및 안내 메세지 팝업 기믹
    if (listLink) {
      listLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert("🔮 시스템 예언: 먼저 마법 계약(로그인)을 맺으십시오.");
      });
    }
    if (mypageLink) {
      mypageLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert("🔮 시스템 예언: 먼저 마법 계약(로그인)을 맺으십시오.");
      });
    }

    // 로그인 버튼 누르면 로그인 페이지로 전환
    if (loginToggleBtn) {
      loginToggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        location.href = "login.html"; 
      });
    }

  } else {
    // 🔐 [로그인 완료 상태 프로토콜]
    if (loginToggleBtn) {
      loginToggleBtn.textContent = `${loginUserName} 님 로그아웃`;
      loginToggleBtn.style.backgroundColor = "#ff4d4d"; // 로그아웃은 파기용 빨간색 변경
    }
    
    // 잠금 상태 스타일 해제
    if (listLink) listLink.classList.remove('disabled-link');
    if (mypageLink) mypageLink.classList.remove('disabled-link');

    // 로그인 후 List 링크 누르면 실시간 요정 소환 로그(Log) 사이드 탭으로 연동
    if (listLink) {
      listLink.addEventListener('click', function(e) {
        e.preventDefault();
        const logTab = document.querySelector('.side-link[data-target="logs-view"]');
        if (logTab) logTab.click();
      });
    }

    // 마이페이지 누르면 지정된 자기소개서 경로로 공식 이동
    if (mypageLink) {
      mypageLink.addEventListener('click', function(e) {
        e.preventDefault();
        location.href = "../introduction/introductionB.html"; 
      });
    }

    // 로그아웃 클릭 시 세션 파기 절차 수행
    if (loginToggleBtn) {
      loginToggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm("🔮 정말로 결계를 닫고 로그아웃 하시겠습니까?")) {
          sessionStorage.removeItem('loginUser');
          sessionStorage.removeItem('loginUserName'); 
          location.reload(); // 초기 상태로 새로고침 리셋
        }
      });
    }
  }
});

// ==========================================================================
// 🔮 4. 마법 오디오 플레이어 실제 MP3 미디어 연동 시스템
// ==========================================================================
const bgmPlayer = document.getElementById('bgm-player');
const playerBtn = document.getElementById('player-btn');
const fdcAudio = document.getElementById('my-audio');

let isFdcPlaying = false;

function toggleFdcPlay() {
  if (!fdcAudio) {
    console.error("오디오 태그(#my-audio)를 찾을 수 없습니다. HTML 구조를 확인하세요.");
    return;
  }

  if (!isFdcPlaying) {
    // [정지 -> 재생 돌입]
    fdcAudio.play().then(() => {
      isFdcPlaying = true;
      if (bgmPlayer) bgmPlayer.classList.add('playing'); // 💿 디스크 회전 및 연보라 아우라 활성화
      if (playerBtn) {
        playerBtn.textContent = '▮▮';
        playerBtn.style.backgroundColor = 'violet';
        playerBtn.style.color = 'purple';
      }
    }).catch(error => {
      console.error("오디오 로드 에러:", error);
      alert("음악 파일(music.mp3)을 재생할 수 없습니다!\nHTML 파일과 같은 위치에 'music.mp3' 파일이 존재하는지 확인해 주세요.");
    });
  } else {
    // [재생 -> 정지 돌입]
    fdcAudio.pause();
    isFdcPlaying = false;
    if (bgmPlayer) bgmPlayer.classList.remove('playing'); // 💿 디스크 정지 및 빨간색 원복
    if (playerBtn) {
      playerBtn.textContent = '▶';
      playerBtn.style.backgroundColor = '#ff4d4d';
      playerBtn.style.color = 'white';
    }
  }
}

// 미니 플레이어 토글 버튼에 실제 기능 바인딩
if (playerBtn) {
  playerBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation(); // 사이드바 메뉴 탭 전환 이벤트 간섭 차단 결계
    toggleFdcPlay();
  });
}

// 음악 스트리밍이 끝까지 도달해 완료되면 자동으로 정지 모드로 UI 복구
if (fdcAudio) {
  fdcAudio.onended = function() {
    isFdcPlaying = false;
    if (bgmPlayer) bgmPlayer.classList.remove('playing');
    if (playerBtn) {
      playerBtn.textContent = '▶';
      playerBtn.style.backgroundColor = '#ff4d4d';
      playerBtn.style.color = 'white';
    }
  };
}
