export const GA_EVENT = {
  HEADER: {
    TOGGLE_SOUND: 'toggle_sound',
    TOGGLE_MUSIC: 'toggle_music',
    VIEW_TUTORIAL: 'view_tutorial',
  },

  MAIN: {
    QUICK_JOIN: 'quick_join',
    OPEN_CREATE_ROOM: 'open_create_room',
    INPUT_JOIN_ROOM: 'input_join_room',
    SOLO_MODE: 'enter_solo_mode',
  },

  CREATE_ROOM: {
    SUBMIT_CREATE: 'submit_create_room',
  },

  ROOM: {
    CLICK_READY: 'click_ready',
    CLICK_START: 'click_start',
    ROOM_INFO_ON_START: 'room_info_on_start',
  },

  GAME: {
    TIMEOUT: 'timeout',
    GAME_END: 'game_end',
  },

  RESULT: {
    CLICK_RESTART: 'click_restart',
    CLICK_GO_MAIN: 'click_go_main',
  },

  USER: {
    FIRST_VISIT: 'first_visit',
  },
} as const;

/**
 *
 * | 카테고리          | 이벤트 이름                | 설명                                  |
 * ─────────────────────────────────────────────────────────────────────────────
 * | HEADER           | toggle_sound              | 효과음 ON/OFF 전환                      |
 * |                  | toggle_music              | BGM ON/OFF 전환                         |
 * |                  | view_tutorial             | 튜토리얼 보기 클릭                     |
 * ─────────────────────────────────────────────────────────────────────────────
 * | MAIN             | quick_join                | 랜덤입장 클릭                          |
 * |                  | open_create_room          | 방 만들기 클릭                         |
 * |                  | input_join_room           | 코드입력 후 입장                       |
 * |                  | enter_solo_mode           | 1인 모드 진입                          |
 * ─────────────────────────────────────────────────────────────────────────────
 * | CREATE_ROOM      | toggle_room_visibility    | 공개/비공개 전환                       |
 * |                  | select_category           | 카테고리 선택                          |
 * |                  | set_turn_time             | 시간 조정                              |
 * |                  | input_nickname            | 닉네임 입력                            |
 * |                  | submit_create_room        | 방 생성 버튼 클릭                      |
 * ─────────────────────────────────────────────────────────────────────────────
 * | ROOM             | click_ready               | 준비 버튼 클릭                         |
 * |                  | click_start               | 게임 시작 버튼                         |
 * |                  | edit_category             | 게임 시작 전 카테고리 변경             |
 * |                  | edit_turn_time            | 게임 시작 전 시간 변경                |
 * |                  | edit_visibility           | 게임 시작 전 공개/비공개 설정 변경     |
 * |                  | room_info_on_start        | 게임 시작 시점의 설정 정보 기록        |
 * ─────────────────────────────────────────────────────────────────────────────
 * | GAME             | timeout                   | 제한 시간 초과 발생                    |
 * |                  | submit_answer             | 정답 제출                              |
 * |                  | correct_answer            | 정답 맞춤                              |
 * |                  | wrong_answer              | 오답 제출                              |
 * |                  | game_end                  | 게임 종료 시점                         |
 * ─────────────────────────────────────────────────────────────────────────────
 * | RESULT           | click_restart             | 재시작 버튼 클릭                       |
 * |                  | click_go_main             | 메인페이지로 이동 버튼 클릭            |
 * ─────────────────────────────────────────────────────────────────────────────
 * | USER             | first_visit               | 첫 방문 유저 (진입 시 1회 기록)         |
 */

