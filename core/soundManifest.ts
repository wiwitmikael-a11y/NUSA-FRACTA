// core/soundManifest.ts

const BASE_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/sfx/';

export const soundManifest = {
    bgm: {
        explore: `${BASE_URL}bgm_explore_ruins.mp3`,
        combat: `${BASE_URL}bgm_combat_tense.mp3`,
    },
    sfx: {
        uiClick: `${BASE_URL}sfx_ui_click_deep.wav`,
        uiOpen: `${BASE_URL}sfx_ui_open_modal.wav`,
        attack: `${BASE_URL}sfx_combat_attack_pipe.wav`,
        critical: `${BASE_URL}sfx_combat_critical_hit.wav`,
        hurt: `${BASE_URL}sfx_combat_player_hurt.wav`,
        win: `${BASE_URL}sfx_combat_win_short.wav`,
        reward: `${BASE_URL}sfx_event_reward.wav`,
        levelUp: `${BASE_URL}sfx_event_levelup.wav`,
        danger: `${BASE_URL}sfx_event_danger.wav`,
    },
};
