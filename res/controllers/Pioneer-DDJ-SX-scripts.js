////////////////////////////////////////////////////////////////////////
// JSHint configuration                                               //
////////////////////////////////////////////////////////////////////////
/* global engine                                                      */
/* global script                                                      */
/* global midi                                                        */
/* global bpm                                                         */
////////////////////////////////////////////////////////////////////////
var PioneerDDJSX = function() {};

/*
	Author: 		DJMaxergy
	Version: 		1.03, 05/10/2017
	Description: 	Pioneer DDJ-SX Controller Mapping for Mixxx
    Source: 		http://github.com/DJMaxergy/mixxx/tree/pioneerDDJSX_mapping
    
    This mapping for the Pioneer DDJ-SX was made by DJMaxergy, Maximilian Beiersdorfer.
    Basing on DDJ-SB2 for Mixxx 2.0 by Michael Stahl (https://github.com/dg3nec/mixxx/tree/DDJ-SB2/res/controllers),
    basing on midiAutoDJ-scripts by Sophia Herzog,
    basing on the work of wingcom (wwingcomm@gmail.com, https://github.com/wingcom/Mixxx-Pioneer-DDJ-SB),
    which in turn was based on the work of Hilton Rudham (https://github.com/hrudham/Mixxx-Pioneer-DDJ-SR).
    Just as wingcom's and Rudham's work, PioneerDDJSX mapping is pusblished under the MIT license.
    
*/

///////////////////////////////////////////////////////////////
//                       USER OPTIONS                        //
///////////////////////////////////////////////////////////////

// Sets the jogwheels sensivity. 1 is default, 2 is twice as sensitive, 0.5 is half as sensitive.
PioneerDDJSX.jogwheelSensivity = 1;

// Sets how much more sensitive the jogwheels get when holding shift.
// Set to 1 to disable jogwheel sensitivity increase when holding shift (default: 10).
PioneerDDJSX.jogwheelShiftMultiplier = 10;

// Sets the default speed slider range (default: 0.08 = 8%).
PioneerDDJSX.speedSliderRange = 0.08;

// Cuts level-meter low frequencies and expands upper frequencies (default: 0). Examples:
// 0.25 -> only signals greater 25%, expanded to full range
// 0.5 -> only signals greater 50%, expanded to full range
PioneerDDJSX.cutVumeter = 0;

// If true, vu meters twinkle if AutoDJ is enabled (default: true).
PioneerDDJSX.twinkleVumeterAutodjOn = true;
// If true, selected track will be added to AutoDJ queue-top on pressing rotary selector,
// else track will be added to AutoDJ queue-bottom (default: false).
PioneerDDJSX.autoDJAddTop = false;
// Sets the duration of sleeping between AutoDJ actions if AutoDJ is enabled [ms] (default: 1000).
PioneerDDJSX.autoDJTickInterval = 1000;
// Sets the maximum adjustment of BPM allowed for beats to sync if AutoDJ is enabled [BPM] (default: 10).
PioneerDDJSX.autoDJMaxBpmAdjustment = 10;
// If true, AutoDJ queue is being shuffled after skipping a track (default: false).
// When using a fixed set of tracks without manual intervention, some tracks may be unreachable, 
// due to having an unfortunate place in the queue ordering. This solves the issue.
PioneerDDJSX.autoDJShuffleAfterSkip = false;

// If true, by releasing rotary selector, 
// track in preview player jumps forward to "jumpPreviewPosition"
// (default: jumpPreviewEnabled = true, jumpPreviewPosition = 0.3). 
PioneerDDJSX.jumpPreviewEnabled = true;
PioneerDDJSX.jumpPreviewPosition = 0.3;

// If true, pad press in SAMPLER-PAD-MODE repeatedly causes sampler to play 
// loaded track from cue-point, else it causes to play loaded track from the beginning (default: false).
PioneerDDJSX.samplerCueGotoAndPlay = false;

// If true, PFL / Cue (headphone) is being activated by loading a track into certain deck (default: true).
PioneerDDJSX.autoPFL = true;

// If true, new in Mixxx 2.1 introduced library controls will be used,
// else old playlist controls will be used (default: false).
PioneerDDJSX.useNewLibraryControls = false;

// If true, SHIFT has to be pressed to activate needle search control (default: false).
PioneerDDJSX.needleSearchShiftEnable = false;


///////////////////////////////////////////////////////////////
//               INIT, SHUTDOWN & GLOBAL HELPER              //
///////////////////////////////////////////////////////////////

PioneerDDJSX.shiftPressed = false;
PioneerDDJSX.rotarySelectorChanged = false;
PioneerDDJSX.panels = [false, false]; // view state of effect and sampler panel

PioneerDDJSX.syncRate = [0, 0, 0, 0];
PioneerDDJSX.gridAdjustSelected = [false, false, false, false];
PioneerDDJSX.gridSlideSelected = [false, false, false, false];
PioneerDDJSX.needleSearchTouched = [false, false, false, false];
PioneerDDJSX.chFaderStart = [null, null, null, null];
PioneerDDJSX.toggledBrake = [false, false, false, false];
PioneerDDJSX.scratchMode = [true, true, true, true];
PioneerDDJSX.wheelLedsBlinkStatus = [0, 0, 0, 0];

// PAD mode storage:
PioneerDDJSX.padModes = {
    'hotCue': 0,
    'loopRoll': 1,
    'slicer': 2,
    'sampler': 3,
    'group1': 4,
    'beatloop': 5,
    'group3': 6,
    'group4': 7
};
PioneerDDJSX.activePadMode = [
    PioneerDDJSX.padModes.hotCue,
    PioneerDDJSX.padModes.hotCue,
    PioneerDDJSX.padModes.hotCue,
    PioneerDDJSX.padModes.hotCue
];
PioneerDDJSX.samplerVelocityMode = [false, false, false, false];

// FX storage:
PioneerDDJSX.fxKnobMSBValue = [0, 0];
PioneerDDJSX.shiftFxKnobMSBValue = [0, 0];

// used for advanced auto dj features:
PioneerDDJSX.blinkAutodjState = false;
PioneerDDJSX.autoDJTickTimer = 0;
PioneerDDJSX.autoDJSyncBPM = false;
PioneerDDJSX.autoDJSyncKey = false;

// used for PAD parameter selection:
PioneerDDJSX.selectedSamplerBank = 0;
PioneerDDJSX.selectedLoopParam = [0, 0, 0, 0];
PioneerDDJSX.selectedLoopRollParam = [2, 2, 2, 2];
PioneerDDJSX.selectedLoopIntervals = [
    [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32],
    [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32],
    [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32],
    [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32]
];
PioneerDDJSX.selectedLooprollIntervals = [
    [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8],
    [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8],
    [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8],
    [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8]
];
PioneerDDJSX.loopIntervals = [
    [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32],
    [1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8, 16],
    [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8],
    [1 / 32, 1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4]
];
PioneerDDJSX.selectedSlicerQuantizeParam = [1, 1, 1, 1];
PioneerDDJSX.selectedSlicerQuantization = [1 / 4, 1 / 4, 1 / 4, 1 / 4];
PioneerDDJSX.slicerQuantizations = [1 / 8, 1 / 4, 1 / 2, 1];

// slicer storage:
PioneerDDJSX.slicerBeatsPassed = [0, 0, 0, 0];
PioneerDDJSX.slicerPreviousBeatsPassed = [0, 0, 0, 0];
PioneerDDJSX.slicerActive = [false, false, false, false];
PioneerDDJSX.slicerAlreadyJumped = [false, false, false, false];
PioneerDDJSX.slicerButton = [0, 0, 0, 0];
PioneerDDJSX.slicerModes = {
    'contSlice': 0,
    'loopSlice': 1
};
PioneerDDJSX.activeSlicerMode = [
    PioneerDDJSX.slicerModes.contSlice,
    PioneerDDJSX.slicerModes.contSlice,
    PioneerDDJSX.slicerModes.contSlice,
    PioneerDDJSX.slicerModes.contSlice
];


PioneerDDJSX.init = function(id) {
    PioneerDDJSX.scratchSettings = {
        'alpha': 1.0 / 8,
        'beta': 1.0 / 8 / 32,
        'jogResolution': 2048,
        'vinylSpeed': 33 + 1 / 3,
    };

    PioneerDDJSX.channelGroups = {
        '[Channel1]': 0x00,
        '[Channel2]': 0x01,
        '[Channel3]': 0x02,
        '[Channel4]': 0x03
    };

    PioneerDDJSX.samplerGroups = {
        '[Sampler1]': 0x00,
        '[Sampler2]': 0x01,
        '[Sampler3]': 0x02,
        '[Sampler4]': 0x03,
        '[Sampler5]': 0x04,
        '[Sampler6]': 0x05,
        '[Sampler7]': 0x06,
        '[Sampler8]': 0x07
    };

    PioneerDDJSX.fxUnitGroups = {
        '[EffectRack1_EffectUnit1]': 0x00,
        '[EffectRack1_EffectUnit2]': 0x01
    };

    PioneerDDJSX.fxEffectGroups = {
        '[EffectRack1_EffectUnit1_Effect1]': 0x00,
        '[EffectRack1_EffectUnit1_Effect2]': 0x01,
        '[EffectRack1_EffectUnit1_Effect3]': 0x02,
        '[EffectRack1_EffectUnit2_Effect1]': 0x00,
        '[EffectRack1_EffectUnit2_Effect2]': 0x01,
        '[EffectRack1_EffectUnit2_Effect3]': 0x02
    };

    PioneerDDJSX.fxAssign = {
        'group_[Channel1]_enable': 0x00,
        'group_[Channel2]_enable': 0x01,
        'group_[Channel3]_enable': 0x02,
        'group_[Channel4]_enable': 0x03
    };

    PioneerDDJSX.ledGroups = {
        'hotCue': 0x00,
        'loopRoll': 0x10,
        'slicer': 0x20,
        'sampler': 0x30,
        'group1': 0x40,
        'group2': 0x50,
        'group3': 0x60,
        'group4': 0x70
    };

    PioneerDDJSX.nonPadLeds = {
        'headphoneCue': 0x54,
        'shiftHeadphoneCue': 0x68,
        'cue': 0x0C,
        'shiftCue': 0x48,
        'keyLock': 0x1A,
        'shiftKeyLock': 0x60,
        'play': 0x0B,
        'shiftPlay': 0x47,
        'vinyl': 0x0D,
        'sync': 0x58,
        'shiftSync': 0x5C,
        'autoLoop': 0x14,
        'shiftAutoLoop': 0x50,
        'loopHalve': 0x12,
        'shiftLoopHalve': 0x61,
        'loopDouble': 0x13,
        'shiftLoopDouble': 0x62,
        'loopIn': 0x10,
        'shiftLoopIn': 0x4C,
        'loopOut': 0x11,
        'shiftLoopOut': 0x4D,
        'censor': 0x15,
        'shiftCensor': 0x38,
        'slip': 0x40,
        'shiftSlip': 0x63,
        'gridAdjust': 0x79,
        'shiftGridAdjust': 0x64,
        'gridSlide': 0x0A,
        'shiftGridSlide': 0x65,
        'takeoverPlus': 0x34,
        'takeoverMinus': 0x37,
        'fx1on': 0x47,
        'shiftFx1on': 0x63,
        'fx2on': 0x48,
        'shiftFx2on': 0x64,
        'fx3on': 0x49,
        'shiftFx3on': 0x65,
        'fxTab': 0x4A,
        'shiftFxTab': 0x66,
        'fx1assignDeck1': 0x4C,
        'shiftFx1assignDeck1': 0x70,
        'fx1assignDeck2': 0x4D,
        'shiftFx1assignDeck2': 0x71,
        'fx1assignDeck3': 0x4E,
        'shiftFx1assignDeck3': 0x72,
        'fx1assignDeck4': 0x4F,
        'shiftFx1assignDeck4': 0x73,
        'fx2assignDeck1': 0x50,
        'shiftFx2assignDeck1': 0x54,
        'fx2assignDeck2': 0x51,
        'shiftFx2assignDeck2': 0x55,
        'fx2assignDeck3': 0x52,
        'shiftFx2assignDeck3': 0x56,
        'fx2assignDeck4': 0x53,
        'shiftFx2assignDeck4': 0x57,
        'masterCue': 0x63,
        'shiftMasterCue': 0x62,
        'loadDeck1': 0x46,
        'shiftLoadDeck1': 0x58,
        'loadDeck2': 0x47,
        'shiftLoadDeck2': 0x59,
        'loadDeck3': 0x48,
        'shiftLoadDeck3': 0x60,
        'loadDeck4': 0x49,
        'shiftLoadDeck4': 0x61,
        'hotCueMode': 0x1B,
        'shiftHotCueMode': 0x69,
        'rollMode': 0x1E,
        'shiftRollMode': 0x6B,
        'slicerMode': 0x20,
        'shiftSlicerMode': 0x6D,
        'samplerMode': 0x22,
        'shiftSamplerMode': 0x6F,
        'longPressSamplerMode': 0x41,
        'parameterLeftHotCueMode': 0x24,
        'shiftParameterLeftHotCueMode': 0x01,
        'parameterLeftRollMode': 0x25,
        'shiftParameterLeftRollMode': 0x02,
        'parameterLeftSlicerMode': 0x26,
        'shiftParameterLeftSlicerMode': 0x03,
        'parameterLeftSamplerMode': 0x27,
        'shiftParameterLeftSamplerMode': 0x04,
        'parameterLeftGroup1Mode': 0x28,
        'shiftParameterLeftGroup1Mode': 0x05,
        'parameterLeftGroup2Mode': 0x29,
        'shiftParameterLeftGroup2Mode': 0x06,
        'parameterLeftGroup3Mode': 0x2A,
        'shiftParameterLeftGroup3Mode': 0x07,
        'parameterLeftGroup4Mode': 0x2B,
        'shiftParameterLeftGroup4Mode': 0x08,
        'parameterRightHotCueMode': 0x2C,
        'shiftParameterRightHotCueMode': 0x09,
        'parameterRightRollMode': 0x2D,
        'shiftParameterRightRollMode': 0x7A,
        'parameterRightSlicerMode': 0x2E,
        'shiftParameterRightSlicerMode': 0x7B,
        'parameterRightSamplerMode': 0x2F,
        'shiftParameterRightSamplerMode': 0x7C,
        'parameterRightGroup1Mode': 0x30,
        'shiftParameterRightGroup1Mode': 0x7D,
        'parameterRightGroup2Mode': 0x31,
        'shiftParameterRightGroup2Mode': 0x7E,
        'parameterRightGroup3Mode': 0x32,
        'shiftParameterRightGroup3Mode': 0x7F,
        'parameterRightGroup4Mode': 0x33,
        'shiftParameterRightGroup4Mode': 0x00
    };

    PioneerDDJSX.illuminationControl = {
        'loadedDeck1': 0x00,
        'loadedDeck2': 0x01,
        'loadedDeck3': 0x02,
        'loadedDeck4': 0x03,
        'unknownDeck1': 0x04,
        'unknownDeck2': 0x05,
        'unknownDeck3': 0x06,
        'unknownDeck4': 0x07,
        'playPauseDeck1': 0x0C,
        'playPauseDeck2': 0x0D,
        'playPauseDeck3': 0x0E,
        'playPauseDeck4': 0x0F,
        'cueDeck1': 0x10,
        'cueDeck2': 0x11,
        'cueDeck3': 0x12,
        'cueDeck4': 0x13,
        'djAppConnect': 0x09
    };

    PioneerDDJSX.valueVuMeter = {
        '[Channel1]_current': 0,
        '[Channel2]_current': 0,
        '[Channel3]_current': 0,
        '[Channel4]_current': 0,
        '[Channel1]_enabled': 1,
        '[Channel2]_enabled': 1,
        '[Channel3]_enabled': 1,
        '[Channel4]_enabled': 1
    };

    // set 32 Samplers as default:
    engine.setValue("[Master]", "num_samplers", 32);

    // activate vu meter timer for Auto DJ:
    if (PioneerDDJSX.twinkleVumeterAutodjOn) {
        PioneerDDJSX.vuMeterTimer = engine.beginTimer(200, "PioneerDDJSX.vuMeterTwinkle()");
    }

    // initiate control status request:
    midi.sendShortMsg(0x9B, 0x08, 0x7F);
    
    // bind controls and init deck parameters:
    PioneerDDJSX.bindNonDeckControlConnections(true);
    for (var index in PioneerDDJSX.channelGroups) {
        if (PioneerDDJSX.channelGroups.hasOwnProperty(index)) {
            PioneerDDJSX.initDeck(index);
        }
    }
};

PioneerDDJSX.shutdown = function() {
    PioneerDDJSX.resetDeck("[Channel1]");
    PioneerDDJSX.resetDeck("[Channel2]");
    PioneerDDJSX.resetDeck("[Channel3]");
    PioneerDDJSX.resetDeck("[Channel4]");
    
    PioneerDDJSX.resetNonDeckLeds();
};

PioneerDDJSX.setDefaultSpeedSliderRange = function(group, range) {
    engine.setValue(group, "rateRange", range);
};


///////////////////////////////////////////////////////////////
//                      VU - METER                           //
///////////////////////////////////////////////////////////////

PioneerDDJSX.vuMeterTwinkle = function() {
    if (engine.getValue("[AutoDJ]", "enabled")) {
        PioneerDDJSX.blinkAutodjState = !PioneerDDJSX.blinkAutodjState;
    }
    PioneerDDJSX.valueVuMeter["[Channel1]_enabled"] = PioneerDDJSX.blinkAutodjState ? 1 : 0;
    PioneerDDJSX.valueVuMeter["[Channel3]_enabled"] = PioneerDDJSX.blinkAutodjState ? 1 : 0;
    PioneerDDJSX.valueVuMeter["[Channel2]_enabled"] = PioneerDDJSX.blinkAutodjState ? 1 : 0;
    PioneerDDJSX.valueVuMeter["[Channel4]_enabled"] = PioneerDDJSX.blinkAutodjState ? 1 : 0;
};


///////////////////////////////////////////////////////////////
//                        AUTO DJ                            //
///////////////////////////////////////////////////////////////

PioneerDDJSX.autodjToggle = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl("[AutoDJ]", "enabled");
    }
};

PioneerDDJSX.autoDJToggleSyncBPM = function(channel, control, value, status, group) {
    if (value) {
        PioneerDDJSX.autoDJSyncBPM = !PioneerDDJSX.autoDJSyncBPM;
        PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds.shiftLoadDeck1, PioneerDDJSX.autoDJSyncBPM);
    }
};

PioneerDDJSX.autoDJToggleSyncKey = function(channel, control, value, status, group) {
    if (value) {
        PioneerDDJSX.autoDJSyncKey = !PioneerDDJSX.autoDJSyncKey;
        PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds.shiftLoadDeck2, PioneerDDJSX.autoDJSyncKey);
    }
};

PioneerDDJSX.autoDJTimer = function(value, group, control) {
    if (value) {
        PioneerDDJSX.autoDJTickTimer = engine.beginTimer(PioneerDDJSX.autoDJTickInterval, "PioneerDDJSX.autoDJControl()");
    } else if (PioneerDDJSX.autoDJTickTimer) {
        engine.stopTimer(PioneerDDJSX.autoDJTickTimer);
        PioneerDDJSX.autoDJTickTimer = 0;
    }
    engine.setValue("[Channel1]", "quantize", value);
    engine.setValue("[Channel2]", "quantize", value);
};

PioneerDDJSX.autoDJControl = function() {
    var prev = 1,
        next = 2,
        prevPos = 0,
        nextPos = 0,
        nextPlaying = 0,
        prevBpm = 0,
        nextBpm = 0,
        diffBpm = 0,
        diffBpmDouble = 0,
        keyOkay = 0,
        prevKey = 0,
        nextKey = 0,
        diffKey = 0;

    if (!PioneerDDJSX.autoDJSyncBPM && !PioneerDDJSX.autoDJSyncKey) {
        return;
    }

    prevPos = engine.getValue("[Channel" + prev + "]", "playposition");
    nextPos = engine.getValue("[Channel" + next + "]", "playposition");
    if (prevPos < nextPos) {
        var tmp = nextPos;
        nextPos = prevPos;
        prevPos = tmp;
        next = 1;
        prev = 2;
    }
    nextPlaying = engine.getValue("[Channel" + next + "]", "play_indicator");
    prevBpm = engine.getValue("[Channel" + prev + "]", "visual_bpm");
    nextBpm = engine.getValue("[Channel" + next + "]", "visual_bpm");
    diffBpm = Math.abs(nextBpm - prevBpm);
    // diffBpm, with bpm of ONE track doubled
    // Note: Where appropriate, Mixxx will automatically match two beats of one.
    if (nextBpm < prevBpm) {
        diffBpmDouble = Math.abs(2 * nextBpm - prevBpm);
    } else {
        diffBpmDouble = Math.abs(2 * prevBpm - nextBpm);
    }

    // Next track is playing --> Fade in progress
    // Note: play_indicator is falsely true, when analysis is needed and similar
    if (nextPlaying && (nextPos > 0.0)) {
        // Bpm synced up --> disable sync before new track loaded
        // Note: Sometimes, Mixxx does not sync close enough for === operator
        if (diffBpm < 0.01 || diffBpmDouble < 0.01) {
            engine.setValue("[Channel" + prev + "]", "sync_mode", 0.0);
            engine.setValue("[Channel" + next + "]", "sync_mode", 0.0);
        } else { // Synchronize
            engine.setValue("[Channel" + prev + "]", "sync_mode", 1.0); // First,  set prev to follower
            engine.setValue("[Channel" + next + "]", "sync_mode", 2.0); // Second, set next to master
        }

        // Only adjust key when approaching the middle of fading
        if (PioneerDDJSX.autoDJSyncKey) {
            var diffFader = Math.abs(engine.getValue("[Master]", "crossfader") - 0.5);
            if (diffFader < 0.25) {
                nextKey = engine.getValue("[Channel" + next + "]", "key");
                engine.setValue("[Channel" + prev + "]", "key", nextKey);
            }
        }
    } else if (!nextPlaying) { // Next track is stopped --> Disable sync and refine track selection
        // First, disable sync; should be off by now, anyway
        engine.setValue("[Channel" + prev + "]", "sync_mode", 0.0); // Disable sync, else loading new track...
        engine.setValue("[Channel" + next + "]", "sync_mode", 0.0); // ...or skipping tracks would break things.

        // Second, refine track selection
        var skip = 0;
        if (diffBpm > PioneerDDJSX.autoDJMaxBpmAdjustment && diffBpmDouble > PioneerDDJSX.autoDJMaxBpmAdjustment) {
            skip = 1;
        }
        // Mixing in key:
        //     1  the difference is exactly 12 (harmonic switch of tonality), or
        //     2  both are of same tonality, and
        //     2a difference is 0, 1 or 2 (difference of up to two semitones: equal key or energy mix)
        //     2b difference corresponds to neighbours in the circle of fifth (harmonic neighbours)
        //   If neither is the case, we skip.
        if (PioneerDDJSX.autoDJSyncKey) {
            keyOkay = 0;
            prevKey = engine.getValue("[Channel" + prev + "]", "visual_key");
            nextKey = engine.getValue("[Channel" + next + "]", "visual_key");
            diffKey = Math.abs(prevKey - nextKey);
            if (diffKey === 12.0) {
                keyOkay = 1; // Switch of tonality
            }
            // Both of same tonality:
            if ((prevKey < 13 && nextKey < 13) || (prevKey > 12 && nextKey > 12)) {
                if (diffKey < 3.0) {
                    keyOkay = 1; // Equal or Energy
                }
                if (diffKey === 5.0 || diffKey === 7.0) {
                    keyOkay = 1; // Neighbours in Circle of Fifth
                }
            }
            if (!keyOkay) {
                skip = 1;
            }
        }

        if (skip) {
            engine.setValue("[AutoDJ]", "skip_next", 1.0);
            engine.setValue("[AutoDJ]", "skip_next", 0.0); // Have to reset manually
            if (PioneerDDJSX.autoDJShuffleAfterSkip) {
                engine.setValue("[AutoDJ]", "shuffle_playlist", 1.0);
                engine.setValue("[AutoDJ]", "shuffle_playlist", 0.0); // Have to reset manually
            }
        }
    }
};


///////////////////////////////////////////////////////////////
//                      CONTROL BINDING                      //
///////////////////////////////////////////////////////////////

PioneerDDJSX.bindDeckControlConnections = function(channelGroup, bind) {
    var i,
        index,
        deck = PioneerDDJSX.channelGroups[channelGroup],
        controlsToFunctions = {
            'play_indicator': 'PioneerDDJSX.playLed',
            'cue_indicator': 'PioneerDDJSX.cueLed',
            'playposition': 'PioneerDDJSX.wheelLeds',
            'pfl': 'PioneerDDJSX.headphoneCueLed',
            'bpm_tap': 'PioneerDDJSX.shiftHeadphoneCueLed',
            'VuMeter': 'PioneerDDJSX.VuMeterLeds',
            'keylock': 'PioneerDDJSX.keyLockLed',
            'slip_enabled': 'PioneerDDJSX.slipLed',
            'quantize': 'PioneerDDJSX.quantizeLed',
            'loop_in': 'PioneerDDJSX.loopInLed',
            'loop_out': 'PioneerDDJSX.loopOutLed',
            'loop_enabled': 'PioneerDDJSX.autoLoopLed',
            'loop_double': 'PioneerDDJSX.loopDoubleLed',
            'loop_halve': 'PioneerDDJSX.loopHalveLed',
            'reloop_exit': 'PioneerDDJSX.loopExitLed',
            'loop_move_1_forward': 'PioneerDDJSX.loopShiftFWLed',
            'loop_move_1_backward': 'PioneerDDJSX.loopShiftBKWLed',
            'reverse': 'PioneerDDJSX.reverseLed',
            'duration': 'PioneerDDJSX.loadLed',
            'sync_enabled': 'PioneerDDJSX.syncLed',
            'beat_active': 'PioneerDDJSX.slicerBeatActive'
        };

    for (i = 1; i <= 8; i++) {
        controlsToFunctions["hotcue_" + i + "_enabled"] = "PioneerDDJSX.hotCueLeds";
    }

    for (index in PioneerDDJSX.selectedLoopIntervals[deck]) {
        if (PioneerDDJSX.selectedLoopIntervals[deck].hasOwnProperty(index)) {
            controlsToFunctions["beatloop_" + PioneerDDJSX.selectedLoopIntervals[deck][index] + "_enabled"] = "PioneerDDJSX.beatloopLeds";
        }
    }

    for (index in PioneerDDJSX.selectedLooprollIntervals[deck]) {
        if (PioneerDDJSX.selectedLooprollIntervals[deck].hasOwnProperty(index)) {
            controlsToFunctions["beatlooproll_" + PioneerDDJSX.selectedLooprollIntervals[deck][index] + "_activate"] = "PioneerDDJSX.beatlooprollLeds";
        }
    }

    script.bindConnections(channelGroup, controlsToFunctions, !bind);

    for (index in PioneerDDJSX.fxUnitGroups) {
        if (PioneerDDJSX.fxUnitGroups.hasOwnProperty(index)) {
            engine.connectControl(index, "group_" + channelGroup + "_enable", "PioneerDDJSX.fxAssignLeds", !bind);
            if (bind) {
                engine.trigger(index, "group_" + channelGroup + "_enable");
            }
        }
    }
};

PioneerDDJSX.bindNonDeckControlConnections = function(bind) {
    var index;

    for (index in PioneerDDJSX.samplerGroups) {
        if (PioneerDDJSX.samplerGroups.hasOwnProperty(index)) {
            engine.connectControl(index, "duration", "PioneerDDJSX.samplerLeds", !bind);
            engine.connectControl(index, "play", "PioneerDDJSX.samplerLedsPlay", !bind);
            if (bind) {
                engine.trigger(index, "duration");
            }
        }
    }

    for (index in PioneerDDJSX.fxUnitGroups) {
        if (PioneerDDJSX.fxUnitGroups.hasOwnProperty(index)) {
            engine.connectControl(index, "enabled", "PioneerDDJSX.fxUnitLeds", !bind);
            engine.connectControl(index, "next_chain", "PioneerDDJSX.fxNextChainLeds", !bind);
            if (bind) {
                engine.trigger(index, "enabled");
            }
        }
    }
    for (index in PioneerDDJSX.fxEffectGroups) {
        if (PioneerDDJSX.fxEffectGroups.hasOwnProperty(index)) {
            engine.connectControl(index, "enabled", "PioneerDDJSX.fxEffectLeds", !bind);
            engine.connectControl(index, "next_effect", "PioneerDDJSX.fxNextEffectLeds", !bind);
            if (bind) {
                engine.trigger(index, "enabled");
            }
        }
    }

    engine.connectControl("[Master]", "headSplit", "PioneerDDJSX.shiftMasterCueLed", !bind);
    if (bind) {
        engine.trigger("[Master]", "headSplit");
    }

    engine.connectControl("[AutoDJ]", "enabled", "PioneerDDJSX.autoDJTimer", !bind);
};


///////////////////////////////////////////////////////////////
//                     DECK INIT / RESET                     //
///////////////////////////////////////////////////////////////

PioneerDDJSX.initDeck = function(group) {
    var deck = PioneerDDJSX.channelGroups[group];

    PioneerDDJSX.bindDeckControlConnections(group, true);

    PioneerDDJSX.updateParameterStatusLeds(
        group,
        PioneerDDJSX.selectedLoopRollParam[deck],
        PioneerDDJSX.selectedLoopParam[deck],
        PioneerDDJSX.selectedSamplerBank,
        PioneerDDJSX.selectedSlicerQuantizeParam[deck]
    );
    PioneerDDJSX.triggerVinylLed(deck);
    PioneerDDJSX.setDefaultSpeedSliderRange(group, PioneerDDJSX.speedSliderRange);

    PioneerDDJSX.illuminateFunctionControl(
        PioneerDDJSX.illuminationControl["loadedDeck" + (deck + 1)],
        false
    );
    PioneerDDJSX.illuminateFunctionControl(
        PioneerDDJSX.illuminationControl["unknownDeck" + (deck + 1)],
        false
    );
    PioneerDDJSX.wheelLedControl(group, 0x00);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.hotCueMode, true); // set HOT CUE Pad-Mode
};

PioneerDDJSX.resetDeck = function(group) {
    PioneerDDJSX.bindDeckControlConnections(group, false);

    PioneerDDJSX.VuMeterLeds(0x00, group, 0x00); // reset VU meter Leds
    PioneerDDJSX.wheelLedControl(group, 0x00); // reset jogwheel Leds
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.hotCueMode, true); // reset HOT CUE Pad-Mode
    // pad Leds:
    for (var i = 0; i < 8; i++) {
        PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.hotCue, i, false, false);
        PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.loopRoll, i, false, false);
        PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.slicer, i, false, false);
        PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.sampler, i, false, false);
        PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.group2, i, false, false);
        PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.hotCue, i, true, false);
        PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.loopRoll, i, true, false);
        PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.slicer, i, true, false);
        PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.sampler, i, true, false);
        PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.group2, i, true, false);
    }
    // non pad Leds:
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.headphoneCue, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftHeadphoneCue, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.cue, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftCue, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.keyLock, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftKeyLock, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.play, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftPlay, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.vinyl, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.sync, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftSync, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.autoLoop, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftAutoLoop, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.loopHalve, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftLoopHalve, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.loopIn, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftLoopIn, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.loopOut, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftLoopOut, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.censor, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftCensor, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.slip, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftSlip, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.gridAdjust, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftGridAdjust, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.gridSlide, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftGridSlide, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.takeoverPlus, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.takeoverMinus, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterLeftRollMode, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterLeftSlicerMode, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterLeftSamplerMode, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterLeftGroup2Mode, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterRightRollMode, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterRightSlicerMode, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterRightSamplerMode, false);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterRightGroup2Mode, false);
};


///////////////////////////////////////////////////////////////
//            HIGH RESOLUTION MIDI INPUT HANDLERS            //
///////////////////////////////////////////////////////////////

PioneerDDJSX.highResMSB = {
    '[Channel1]': {},
    '[Channel2]': {},
    '[Channel3]': {},
    '[Channel4]': {},
    '[Master]': {},
    '[Samplers]': {}
};

PioneerDDJSX.tempoSliderMSB = function(channel, control, value, status, group) {
    PioneerDDJSX.highResMSB[group].tempoSlider = value;
};

PioneerDDJSX.tempoSliderLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJSX.highResMSB[group].tempoSlider << 7) + value,
        sliderRate = 1 - (fullValue / 0x3FFF),
        deck = PioneerDDJSX.channelGroups[group];

    engine.setParameter(group, "rate", sliderRate);

    if (PioneerDDJSX.syncRate[deck] !== 0) {
        if (PioneerDDJSX.syncRate[deck] !== engine.getValue(group, "rate")) {
            PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.takeoverPlus, 0);
            PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.takeoverMinus, 0);
            PioneerDDJSX.syncRate[deck] = 0;
        }
    }
};

PioneerDDJSX.gainKnobMSB = function(channel, control, value, status, group) {
    PioneerDDJSX.highResMSB[group].gainKnob = value;
};

PioneerDDJSX.gainKnobLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJSX.highResMSB[group].gainKnob << 7) + value;
    engine.setParameter(group, "pregain", fullValue / 0x3FFF);
};

PioneerDDJSX.filterHighKnobMSB = function(channel, control, value, status, group) {
    PioneerDDJSX.highResMSB[group].filterHigh = value;
};

PioneerDDJSX.filterHighKnobLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJSX.highResMSB[group].filterHigh << 7) + value;
    engine.setParameter("[EqualizerRack1_" + group + "_Effect1]", "parameter3", fullValue / 0x3FFF);
};

PioneerDDJSX.filterMidKnobMSB = function(channel, control, value, status, group) {
    PioneerDDJSX.highResMSB[group].filterMid = value;
};

PioneerDDJSX.filterMidKnobLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJSX.highResMSB[group].filterMid << 7) + value;
    engine.setParameter("[EqualizerRack1_" + group + "_Effect1]", "parameter2", fullValue / 0x3FFF);
};

PioneerDDJSX.filterLowKnobMSB = function(channel, control, value, status, group) {
    PioneerDDJSX.highResMSB[group].filterLow = value;
};

PioneerDDJSX.filterLowKnobLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJSX.highResMSB[group].filterLow << 7) + value;
    engine.setParameter("[EqualizerRack1_" + group + "_Effect1]", "parameter1", fullValue / 0x3FFF);
};

PioneerDDJSX.deckFaderMSB = function(channel, control, value, status, group) {
    PioneerDDJSX.highResMSB[group].deckFader = value;
};

PioneerDDJSX.deckFaderLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJSX.highResMSB[group].deckFader << 7) + value;

    if (PioneerDDJSX.shiftPressed &&
        engine.getValue(group, "volume") === 0 &&
        fullValue !== 0 &&
        engine.getValue(group, "play") === 0
    ) {
        PioneerDDJSX.chFaderStart[channel] = engine.getValue(group, "playposition");
        engine.setValue(group, "play", 1);
    } else if (
        PioneerDDJSX.shiftPressed &&
        engine.getValue(group, "volume") !== 0 &&
        fullValue === 0 &&
        engine.getValue(group, "play") === 1 &&
        PioneerDDJSX.chFaderStart[channel] !== null
    ) {
        engine.setValue(group, "play", 0);
        engine.setValue(group, "playposition", PioneerDDJSX.chFaderStart[channel]);
        PioneerDDJSX.chFaderStart[channel] = null;
    }
    engine.setParameter(group, "volume", fullValue / 0x3FFF);
};

PioneerDDJSX.filterKnobMSB = function(channel, control, value, status, group) {
    PioneerDDJSX.highResMSB[group].filterKnob = value;
};

PioneerDDJSX.filterKnobLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJSX.highResMSB[group].filterKnob << 7) + value;
    engine.setParameter("[QuickEffectRack1_" + group + "]", "super1", fullValue / 0x3FFF);
};

PioneerDDJSX.crossfaderCurveKnobMSB = function(channel, control, value, status, group) {
    PioneerDDJSX.highResMSB[group].crossfaderCurveKnob = value;
};

PioneerDDJSX.crossfaderCurveKnobLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJSX.highResMSB[group].crossfaderCurveKnob << 7) + value;
    script.crossfaderCurve(fullValue, 0x00, 0x3FFF);
};

PioneerDDJSX.samplerVolumeFaderMSB = function(channel, control, value, status, group) {
    PioneerDDJSX.highResMSB[group].samplerVolumeFader = value;
};

PioneerDDJSX.samplerVolumeFaderLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJSX.highResMSB[group].samplerVolumeFader << 7) + value;
    for (var i = 1; i <= 32; i++) {
        engine.setParameter("[Sampler" + i + "]", "volume", fullValue / 0x3FFF);
    }
};

PioneerDDJSX.crossFaderMSB = function(channel, control, value, status, group) {
    PioneerDDJSX.highResMSB[group].crossFader = value;
};

PioneerDDJSX.crossFaderLSB = function(channel, control, value, status, group) {
    var fullValue = (PioneerDDJSX.highResMSB[group].crossFader << 7) + value;
    engine.setParameter(group, "crossfader", fullValue / 0x3FFF);
};


///////////////////////////////////////////////////////////////
//           SINGLE MESSAGE MIDI INPUT HANDLERS              //
///////////////////////////////////////////////////////////////

PioneerDDJSX.shiftButton = function(channel, control, value, status, group) {
    var index = 0,
        parameter = 0;
    PioneerDDJSX.shiftPressed = (value === 0x7F);
    for (index in PioneerDDJSX.chFaderStart) {
        if (typeof index === "number") {
            PioneerDDJSX.chFaderStart[index] = null;
        }
    }
    if (value) {
        for (index in PioneerDDJSX.fxEffectGroups) {
            if (PioneerDDJSX.fxEffectGroups.hasOwnProperty(index)) {
                engine.softTakeoverIgnoreNextValue(index, "meta");
                for (parameter = 1; parameter <= 3; parameter++) {
                    if (engine.getValue(index, "parameter" + parameter + "_loaded")) {
                        engine.softTakeover(index, "parameter" + parameter, true);
                    }
                }
            }
        }
    }
    if (!value) {
        for (index in PioneerDDJSX.fxEffectGroups) {
            if (PioneerDDJSX.fxEffectGroups.hasOwnProperty(index)) {
                engine.softTakeover(index, "meta", true);
                for (parameter = 1; parameter <= 3; parameter++) {
                    if (engine.getValue(index, "parameter" + parameter + "_loaded")) {
                        engine.softTakeoverIgnoreNextValue(index, "parameter" + parameter);
                    }
                }
            }
        }
    }
};

PioneerDDJSX.playButton = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group],
        playing = engine.getValue(group, "play");

    if (value) {
        if (!PioneerDDJSX.toggledBrake[deck]) {
            script.toggleControl(group, "play");
        }
        if (playing) {
            script.brake(channel, control, value, status, group);
            PioneerDDJSX.toggledBrake[deck] = true;
        }
    } else {
        if (PioneerDDJSX.toggledBrake[deck]) {
            script.brake(channel, control, value, status, group);
            PioneerDDJSX.toggledBrake[deck] = false;
        }
    }
};

PioneerDDJSX.playStutterButton = function(channel, control, value, status, group) {
    engine.setValue(group, "play_stutter", value ? 1 : 0);
};

PioneerDDJSX.cueButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "cue_default");
};

PioneerDDJSX.headphoneCueButton = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl(group, "pfl");
    }
};

PioneerDDJSX.headphoneShiftCueButton = function(channel, control, value, status, group) {
    if (value) {
        bpm.tapButton(PioneerDDJSX.channelGroups[group] + 1);
    }
};

PioneerDDJSX.headphoneSplitCueButton = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl(group, "headSplit");
    }
};

PioneerDDJSX.toggleHotCueMode = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];
    //HOTCUE
    if (value) {
        PioneerDDJSX.activePadMode[deck] = PioneerDDJSX.padModes.hotCue;
        PioneerDDJSX.activeSlicerMode[deck] = PioneerDDJSX.slicerModes.contSlice;
        PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.hotCueMode, value);
    }
};

PioneerDDJSX.toggleBeatloopRollMode = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];
    //ROLL
    if (value) {
        PioneerDDJSX.activePadMode[deck] = PioneerDDJSX.padModes.loopRoll;
        PioneerDDJSX.activeSlicerMode[deck] = PioneerDDJSX.slicerModes.contSlice;
        PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.rollMode, value);
    }
};

PioneerDDJSX.toggleSlicerMode = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];
    //SLICER
    if (value) {
        if (PioneerDDJSX.activePadMode[deck] === PioneerDDJSX.padModes.slicer && 
            PioneerDDJSX.activeSlicerMode[deck] === PioneerDDJSX.slicerModes.contSlice) {
            PioneerDDJSX.activeSlicerMode[deck] = PioneerDDJSX.slicerModes.loopSlice;
            engine.setValue(group, "slip_enabled", true);
        } else {
            PioneerDDJSX.activeSlicerMode[deck] = PioneerDDJSX.slicerModes.contSlice;
            engine.setValue(group, "slip_enabled", false);
        }
        PioneerDDJSX.activePadMode[deck] = PioneerDDJSX.padModes.slicer;
        PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.slicerMode, value);
    }
};

PioneerDDJSX.toggleSamplerMode = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];
    //SAMPLER
    if (value) {
        PioneerDDJSX.activePadMode[deck] = PioneerDDJSX.padModes.sampler;
        PioneerDDJSX.activeSlicerMode[deck] = PioneerDDJSX.slicerModes.contSlice;
        PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.samplerMode, value);
    }
};

PioneerDDJSX.toggleSamplerVelocityMode = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group],
        index = 0;
    PioneerDDJSX.samplerVelocityMode[deck] = value ? true : false;
    if (value) {
        PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.longPressSamplerMode, value);
        for (index = 1; index <= 32; index++) {
            engine.setParameter("[Sampler" + index + "]", "volume", 0);
        }
    } else {
        for (index = 1; index <= 32; index++) {
            engine.setParameter("[Sampler" + index + "]", "volume", 1);
        }
    }
};

PioneerDDJSX.toggleBeatloopMode = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];
    //GROUP2
    if (value) {
        PioneerDDJSX.activePadMode[deck] = PioneerDDJSX.padModes.beatloop;
        PioneerDDJSX.activeSlicerMode[deck] = PioneerDDJSX.slicerModes.contSlice;
        PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftRollMode, value);
    }
};

PioneerDDJSX.hotCueButtons = function(channel, control, value, status, group) {
    var index = control + 1;
    script.toggleControl(group, "hotcue_" + index + "_activate");
};

PioneerDDJSX.clearHotCueButtons = function(channel, control, value, status, group) {
    var index = control - 0x08 + 1;
    script.toggleControl(group, "hotcue_" + index + "_clear");
};

PioneerDDJSX.beatloopButtons = function(channel, control, value, status, group) {
    var index = control - 0x50,
        deck = PioneerDDJSX.channelGroups[group];
    script.toggleControl(
        group,
        "beatloop_" + PioneerDDJSX.selectedLoopIntervals[deck][index] + "_toggle"
    );
};

PioneerDDJSX.slicerButtons = function(channel, control, value, status, group) {
    var index = control - 0x20,
        padNum = index % 8,
        deck = PioneerDDJSX.channelGroups[group],
        startPos = 0,
        beatsToJump = 0;

    if (PioneerDDJSX.activeSlicerMode[deck] === PioneerDDJSX.slicerModes.loopSlice) {
        PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.slicer, padNum, false, !value);
    } else {
        PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.slicer, padNum, false, value);
    }
    PioneerDDJSX.slicerActive[deck] = value ? true : false;
    PioneerDDJSX.slicerButton[deck] = index % 8;

    if (value) {
        startPos = PioneerDDJSX.slicerBeatsPassed[deck];
        beatsToJump = PioneerDDJSX.slicerButton[deck] - ((startPos % 8) + 1);
        if (PioneerDDJSX.slicerButton[deck] === 0 && beatsToJump === -8) {
            beatsToJump = 0;
        }
        if (startPos >= Math.abs(beatsToJump) && PioneerDDJSX.slicerPreviousBeatsPassed[deck] !== PioneerDDJSX.slicerBeatsPassed[deck]) {
            PioneerDDJSX.slicerPreviousBeatsPassed[deck] = PioneerDDJSX.slicerBeatsPassed[deck];
            if (Math.abs(beatsToJump) > 0) {
                engine.setValue(group, "beatjump", beatsToJump);
            }
        }
    }

    if (PioneerDDJSX.activeSlicerMode[deck] === PioneerDDJSX.slicerModes.contSlice) {
        engine.setValue(group, "beatloop_" + PioneerDDJSX.selectedSlicerQuantization[deck] + "_activate", value);
        engine.setValue(group, "slip_enabled", value);
    }
};

PioneerDDJSX.beatloopRollButtons = function(channel, control, value, status, group) {
    var index = control - 0x10,
        deck = PioneerDDJSX.channelGroups[group];
    script.toggleControl(
        group,
        "beatlooproll_" + PioneerDDJSX.selectedLooprollIntervals[deck][index] + "_activate"
    );
};

PioneerDDJSX.samplerButtons = function(channel, control, value, status, group) {
    var index = control - 0x30 + 1,
        deckOffset = PioneerDDJSX.selectedSamplerBank * 8,
        sampleDeck = "[Sampler" + (index + deckOffset) + "]",
        playMode = PioneerDDJSX.samplerCueGotoAndPlay ? "cue_gotoandplay" : "start_play";

    if (engine.getValue(sampleDeck, "track_loaded")) {
        engine.setValue(sampleDeck, playMode, value ? 1 : 0);
    } else {
        engine.setValue(sampleDeck, "LoadSelectedTrack", value ? 1 : 0);
    }
};

PioneerDDJSX.stopSamplerButtons = function(channel, control, value, status, group) {
    var index = control - 0x38 + 1,
        deckOffset = PioneerDDJSX.selectedSamplerBank * 8,
        sampleDeck = "[Sampler" + (index + deckOffset) + "]",
        trackLoaded = engine.getValue(sampleDeck, "track_loaded"),
        playing = engine.getValue(sampleDeck, "play");

    if (trackLoaded && playing) {
        script.toggleControl(sampleDeck, "stop");
    } else if (trackLoaded && !playing && value) {
        script.toggleControl(sampleDeck, "eject");
    }
};

PioneerDDJSX.samplerVelocityVolume = function(channel, control, value, status, group) {
    var index = control - 0x30 + 1,
        deck = PioneerDDJSX.channelGroups[group],
        deckOffset = PioneerDDJSX.selectedSamplerBank * 8,
        sampleDeck = "[Sampler" + (index + deckOffset) + "]",
        vol = value / 0x7F;

    if (PioneerDDJSX.samplerVelocityMode[deck]) {
        engine.setParameter(sampleDeck, "volume", vol);
    }
};

PioneerDDJSX.changeParameters = function(group, ctrl, increment) {
    var deck = PioneerDDJSX.channelGroups[group],
        index,
        offset = 0,
        samplerIndex = 0;

    //Roll Mode:
    if (ctrl === PioneerDDJSX.nonPadLeds.parameterLeftRollMode || ctrl === PioneerDDJSX.nonPadLeds.parameterRightRollMode) {
        // unbind previous connected controls:
        for (index in PioneerDDJSX.selectedLooprollIntervals[deck]) {
            if (PioneerDDJSX.selectedLooprollIntervals[deck].hasOwnProperty(index)) {
                engine.connectControl(
                    group,
                    "beatlooproll_" + PioneerDDJSX.selectedLooprollIntervals[deck][index] + "_activate",
                    "PioneerDDJSX.beatlooprollLeds",
                    true
                );
            }
        }
        // change parameter set:
        if (ctrl === PioneerDDJSX.nonPadLeds.parameterLeftRollMode && PioneerDDJSX.selectedLoopRollParam[deck] > 0) {
            PioneerDDJSX.selectedLoopRollParam[deck] = PioneerDDJSX.selectedLoopRollParam[deck] - 1;
        } else if (ctrl === PioneerDDJSX.nonPadLeds.parameterRightRollMode && PioneerDDJSX.selectedLoopRollParam[deck] < 3) {
            PioneerDDJSX.selectedLoopRollParam[deck] = PioneerDDJSX.selectedLoopRollParam[deck] + 1;
        }
        PioneerDDJSX.selectedLooprollIntervals[deck] = PioneerDDJSX.loopIntervals[PioneerDDJSX.selectedLoopRollParam[deck]];
        // bind new controls:
        for (index in PioneerDDJSX.selectedLooprollIntervals[deck]) {
            if (PioneerDDJSX.selectedLooprollIntervals[deck].hasOwnProperty(index)) {
                engine.connectControl(
                    group,
                    "beatlooproll_" + PioneerDDJSX.selectedLooprollIntervals[deck][index] + "_activate",
                    "PioneerDDJSX.beatlooprollLeds",
                    false
                );
            }
        }
    }
    //Beatloop Mode:
    if (ctrl === PioneerDDJSX.nonPadLeds.parameterLeftGroup2Mode || ctrl === PioneerDDJSX.nonPadLeds.parameterRightGroup2Mode) {
        // unbind previous connected controls:
        for (index in PioneerDDJSX.selectedLoopIntervals[deck]) {
            if (PioneerDDJSX.selectedLoopIntervals[deck].hasOwnProperty(index)) {
                engine.connectControl(
                    group,
                    "beatloop_" + PioneerDDJSX.selectedLoopIntervals[deck][index] + "_enabled",
                    "PioneerDDJSX.beatloopLeds",
                    true
                );
            }
        }
        // change parameter set:
        if (ctrl === PioneerDDJSX.nonPadLeds.parameterLeftGroup2Mode && PioneerDDJSX.selectedLoopParam[deck] > 0) {
            PioneerDDJSX.selectedLoopParam[deck] = PioneerDDJSX.selectedLoopParam[deck] - 1;
        } else if (ctrl === PioneerDDJSX.nonPadLeds.parameterRightGroup2Mode && PioneerDDJSX.selectedLoopParam[deck] < 3) {
            PioneerDDJSX.selectedLoopParam[deck] = PioneerDDJSX.selectedLoopParam[deck] + 1;
        }
        PioneerDDJSX.selectedLoopIntervals[deck] = PioneerDDJSX.loopIntervals[PioneerDDJSX.selectedLoopParam[deck]];
        // bind new controls:
        for (index in PioneerDDJSX.selectedLoopIntervals[deck]) {
            if (PioneerDDJSX.selectedLoopIntervals[deck].hasOwnProperty(index)) {
                engine.connectControl(
                    group,
                    "beatloop_" + PioneerDDJSX.selectedLoopIntervals[deck][index] + "_enabled",
                    "PioneerDDJSX.beatloopLeds",
                    false
                );
            }
        }
    }
    //Sampler Mode:
    if (ctrl === PioneerDDJSX.nonPadLeds.parameterLeftSamplerMode || ctrl === PioneerDDJSX.nonPadLeds.parameterRightSamplerMode) {
        // unbind previous connected controls:
        for (index in PioneerDDJSX.samplerGroups) {
            if (PioneerDDJSX.samplerGroups.hasOwnProperty(index)) {
                offset = PioneerDDJSX.selectedSamplerBank * 8;
                samplerIndex = (PioneerDDJSX.samplerGroups[index] + 1) + offset;
                engine.connectControl(
                    "[Sampler" + samplerIndex + "]",
                    "duration",
                    "PioneerDDJSX.samplerLeds",
                    true
                );
                engine.connectControl(
                    "[Sampler" + samplerIndex + "]",
                    "play",
                    "PioneerDDJSX.samplerLedsPlay",
                    true
                );
            }
        }
        // change sampler bank:
        if (ctrl === PioneerDDJSX.nonPadLeds.parameterLeftSamplerMode && PioneerDDJSX.selectedSamplerBank > 0) {
            PioneerDDJSX.selectedSamplerBank = PioneerDDJSX.selectedSamplerBank - 1;
        } else if (ctrl === PioneerDDJSX.nonPadLeds.parameterRightSamplerMode && PioneerDDJSX.selectedSamplerBank < 3) {
            PioneerDDJSX.selectedSamplerBank = PioneerDDJSX.selectedSamplerBank + 1;
        }
        // bind new controls:
        for (index in PioneerDDJSX.samplerGroups) {
            if (PioneerDDJSX.samplerGroups.hasOwnProperty(index)) {
                offset = PioneerDDJSX.selectedSamplerBank * 8;
                samplerIndex = (PioneerDDJSX.samplerGroups[index] + 1) + offset;
                engine.connectControl(
                    "[Sampler" + samplerIndex + "]",
                    "duration",
                    "PioneerDDJSX.samplerLeds",
                    false
                );
                engine.connectControl(
                    "[Sampler" + samplerIndex + "]",
                    "play",
                    "PioneerDDJSX.samplerLedsPlay",
                    false
                );
                engine.trigger("[Sampler" + samplerIndex + "]", "duration");
            }
        }
    }
    //Group2 Mode (Slicer):
    if (ctrl === PioneerDDJSX.nonPadLeds.parameterLeftSlicerMode || ctrl === PioneerDDJSX.nonPadLeds.parameterRightSlicerMode) {
        // change parameter set:
        if (ctrl === PioneerDDJSX.nonPadLeds.parameterLeftSlicerMode && PioneerDDJSX.selectedSlicerQuantizeParam[deck] > 0) {
            PioneerDDJSX.selectedSlicerQuantizeParam[deck] = PioneerDDJSX.selectedSlicerQuantizeParam[deck] - 1;
        } else if (ctrl === PioneerDDJSX.nonPadLeds.parameterRightSlicerMode && PioneerDDJSX.selectedSlicerQuantizeParam[deck] < 3) {
            PioneerDDJSX.selectedSlicerQuantizeParam[deck] = PioneerDDJSX.selectedSlicerQuantizeParam[deck] + 1;
        }
        PioneerDDJSX.selectedSlicerQuantization[deck] = PioneerDDJSX.slicerQuantizations[PioneerDDJSX.selectedSlicerQuantizeParam[deck]];
    }

    // update parameter status leds:
    PioneerDDJSX.updateParameterStatusLeds(
        group,
        PioneerDDJSX.selectedLoopRollParam[deck],
        PioneerDDJSX.selectedLoopParam[deck],
        PioneerDDJSX.selectedSamplerBank,
        PioneerDDJSX.selectedSlicerQuantizeParam[deck]
    );
};

PioneerDDJSX.parameterLeft = function(channel, control, value, status, group) {
    if (value) {
        PioneerDDJSX.changeParameters(group, control, false);
    }
};

PioneerDDJSX.parameterRight = function(channel, control, value, status, group) {
    if (value) {
        PioneerDDJSX.changeParameters(group, control, true);
    }
};

PioneerDDJSX.vinylButton = function(channel, control, value, status, group) {
    PioneerDDJSX.toggleScratch(channel, control, value, status, group);
};

PioneerDDJSX.slipButton = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl(group, "slip_enabled");
    }
};

PioneerDDJSX.keyLockButton = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl(group, "keylock");
    }
};

PioneerDDJSX.shiftKeyLockButton = function(channel, control, value, status, group) {
    var range = PioneerDDJSX.speedSliderRange;

    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftKeyLock, value);

    if (range === 1.00) {
        range = 0.08;
    } else if ((range * 2) > 1.00) {
        range = 1.00;
    } else {
        range = range * 2;
    }

    if (value) {
        engine.setValue(group, "rateRange", range);
        PioneerDDJSX.speedSliderRange = range;
    }
};

PioneerDDJSX.tempoResetButton = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];
    if (value) {
        engine.setValue(group, "rate", 0);
        if (PioneerDDJSX.syncRate[deck] !== engine.getValue(group, "rate")) {
            PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.takeoverPlus, 0);
            PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.takeoverMinus, 0);
            PioneerDDJSX.syncRate[deck] = 0;
        }
    }
};

PioneerDDJSX.autoLoopButton = function(channel, control, value, status, group) {
    if (value) {
        if (engine.getValue(group, "loop_enabled")) {
            engine.setValue(group, "reloop_exit", true);
        } else {
            engine.setValue(group, "beatloop_" + 4 + "_toggle", true);
        }
    }
};

PioneerDDJSX.loopActiveButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "reloop_exit");
};

PioneerDDJSX.loopInButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "loop_in");
};

PioneerDDJSX.loopOutButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "loop_out");
};

PioneerDDJSX.loopExitButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "reloop_exit");
};

PioneerDDJSX.loopHalveButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "loop_halve");
};

PioneerDDJSX.loopDoubleButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "loop_double");
};

PioneerDDJSX.loopMoveBackButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "loop_move_1_backward");
};

PioneerDDJSX.loopMoveForwardButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "loop_move_1_forward");
};

PioneerDDJSX.loadButton = function(channel, control, value, status, group) {
    if (value) {
        engine.setValue(group, "LoadSelectedTrack", true);
        if (PioneerDDJSX.autoPFL) {
            for (var index in PioneerDDJSX.channelGroups) {
                if (PioneerDDJSX.channelGroups.hasOwnProperty(index)) {
                    if (index === group) {
                        engine.setValue(index, "pfl", true);
                    } else {
                        engine.setValue(index, "pfl", false);
                    }
                }
            }
        }
    }
};

PioneerDDJSX.crossfaderAssignCenter = function(channel, control, value, status, group) {
    if (value) {
        engine.setValue(group, "orientation", 1);
    }
};

PioneerDDJSX.crossfaderAssignLeft = function(channel, control, value, status, group) {
    if (value) {
        engine.setValue(group, "orientation", 0);
    }
};

PioneerDDJSX.crossfaderAssignRight = function(channel, control, value, status, group) {
    if (value) {
        engine.setValue(group, "orientation", 2);
    }
};

PioneerDDJSX.reverseRollButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "reverseroll");
};

PioneerDDJSX.reverseButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "reverse");
};

PioneerDDJSX.gridAdjustButton = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];

    PioneerDDJSX.gridAdjustSelected[deck] = value ? true : false;
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.gridAdjust, value);
};

PioneerDDJSX.gridSetButton = function(channel, control, value, status, group) {
    script.toggleControl(group, "beats_translate_curpos");
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftGridAdjust, value);
};

PioneerDDJSX.gridSlideButton = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];

    PioneerDDJSX.gridSlideSelected[deck] = value ? true : false;
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.gridSlide, value);
};

PioneerDDJSX.spinbackButton = function(channel, control, value, status, group) {
    script.spinback(channel, control, value, status, group);
};

PioneerDDJSX.syncButton = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl(group, "sync_enabled");
    }
};

PioneerDDJSX.quantizeButton = function(channel, control, value, status, group) {
    if (value) {
        script.toggleControl(group, "quantize");
    }
};

PioneerDDJSX.needleSearchTouch = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];
    if (PioneerDDJSX.needleSearchShiftEnable) {
        PioneerDDJSX.needleSearchTouched[deck] = PioneerDDJSX.shiftPressed && (value ? true : false);
    } else {
        PioneerDDJSX.needleSearchTouched[deck] = value ? true : false;
    }
};

PioneerDDJSX.needleSearchStripPosition = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];
    if (PioneerDDJSX.needleSearchTouched[deck]) {
        var position = value / 0x7F;
        engine.setValue(group, "playposition", position);
    }
};

PioneerDDJSX.panelSelectButton = function(channel, control, value, status, group) {
    if (value) {
        if ((PioneerDDJSX.panels[0] === false) && (PioneerDDJSX.panels[1] === false)) {
            PioneerDDJSX.panels[0] = true;
        } else if ((PioneerDDJSX.panels[0] === true) && (PioneerDDJSX.panels[1] === false)) {
            PioneerDDJSX.panels[1] = true;
        } else if ((PioneerDDJSX.panels[0] === true) && (PioneerDDJSX.panels[1] === true)) {
            PioneerDDJSX.panels[0] = false;
        } else if ((PioneerDDJSX.panels[0] === false) && (PioneerDDJSX.panels[1] === true)) {
            PioneerDDJSX.panels[1] = false;
        }

        engine.setValue("[Samplers]", "show_samplers", PioneerDDJSX.panels[0]);
        engine.setValue("[EffectRack1]", "show", PioneerDDJSX.panels[1]);
    }
};


///////////////////////////////////////////////////////////////
//                          LED HELPERS                      //
///////////////////////////////////////////////////////////////

PioneerDDJSX.deckConverter = function(group) {
    if (PioneerDDJSX.channelGroups.hasOwnProperty(group)) {
        return PioneerDDJSX.channelGroups[group];
    }
    return group;
};

PioneerDDJSX.flashLedState = 0;

PioneerDDJSX.flashLed = function(deck, ledNumber) {
    if (PioneerDDJSX.flashLedState === 0) {
        PioneerDDJSX.nonPadLedControl(deck, ledNumber, 1);
        PioneerDDJSX.flashLedState = 1;
    } else if (PioneerDDJSX.flashLedState === 1) {
        PioneerDDJSX.nonPadLedControl(deck, ledNumber, 0);
        PioneerDDJSX.flashLedState = 0;
    }
};

PioneerDDJSX.resetNonDeckLeds = function() {
    var indexFxUnit,
        indexFxLed;

    // fx Leds:
    for (indexFxUnit in PioneerDDJSX.fxUnitGroups) {
        if (PioneerDDJSX.fxUnitGroups.hasOwnProperty(indexFxUnit)) {
            for (indexFxLed in PioneerDDJSX.fxEffectGroups) {
                if (PioneerDDJSX.fxEffectGroups.hasOwnProperty(indexFxLed)) {
                    PioneerDDJSX.fxLedControl(
                        PioneerDDJSX.fxUnitGroups[indexFxUnit],
                        PioneerDDJSX.fxEffectGroups[indexFxLed],
                        false,
                        false
                    );
                    PioneerDDJSX.fxLedControl(
                        PioneerDDJSX.fxUnitGroups[indexFxUnit],
                        PioneerDDJSX.fxEffectGroups[indexFxLed],
                        true,
                        false
                    );
                }
            }
            PioneerDDJSX.fxLedControl(PioneerDDJSX.fxUnitGroups[indexFxUnit], 0x03, false, false);
            PioneerDDJSX.fxLedControl(PioneerDDJSX.fxUnitGroups[indexFxUnit], 0x03, true, false);
        }
    }

    // fx assign Leds:
    for (indexFxUnit in PioneerDDJSX.fxUnitGroups) {
        if (PioneerDDJSX.fxUnitGroups.hasOwnProperty(indexFxUnit)) {
            for (indexFxLed in PioneerDDJSX.fxAssign) {
                if (PioneerDDJSX.fxAssign.hasOwnProperty(indexFxLed)) {
                    PioneerDDJSX.fxAssignLedControl(
                        PioneerDDJSX.fxUnitGroups[indexFxUnit],
                        PioneerDDJSX.fxAssign[indexFxLed],
                        false,
                        false
                    );
                    PioneerDDJSX.fxAssignLedControl(
                        PioneerDDJSX.fxUnitGroups[indexFxUnit],
                        PioneerDDJSX.fxAssign[indexFxLed],
                        true,
                        false
                    );
                }
            }
        }
    }

    // general Leds:
    PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds.shiftMasterCue, false);
    PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds.loadDeck1, false);
    PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds.shiftLoadDeck1, false);
    PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds.loadDeck2, false);
    PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds.shiftLoadDeck2, false);
    PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds.loadDeck3, false);
    PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds.shiftLoadDeck3, false);
    PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds.loadDeck4, false);
    PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds.shiftLoadDeck4, false);
};

PioneerDDJSX.fxAssignLedControl = function(unit, ledNumber, shift, active) {
    var fxAssignLedsBaseChannel = 0x96,
        fxAssignLedsBaseControl = (shift ? 0x70 : 0x4C);

    if (unit === PioneerDDJSX.fxUnitGroups["[EffectRack1_EffectUnit2]"]) {
        fxAssignLedsBaseControl = (shift ? 0x54 : 0x50);
    }

    midi.sendShortMsg(
        fxAssignLedsBaseChannel,
        fxAssignLedsBaseControl + ledNumber,
        active ? 0x7F : 0x00
    );
};

PioneerDDJSX.fxLedControl = function(unit, ledNumber, shift, active) {
    var fxLedsBaseChannel = 0x94,
        fxLedsBaseControl = (shift ? 0x63 : 0x47);

    midi.sendShortMsg(
        fxLedsBaseChannel + unit,
        fxLedsBaseControl + ledNumber,
        active ? 0x7F : 0x00
    );
};

PioneerDDJSX.padLedControl = function(deck, groupNumber, ledNumber, shift, active) {
    var padLedsBaseChannel = 0x97,
        padLedControl = (shift ? 0x08 : 0x00) + groupNumber + ledNumber,
        midiChannelOffset = PioneerDDJSX.deckConverter(deck);

    if (midiChannelOffset !== null) {
        midi.sendShortMsg(
            padLedsBaseChannel + midiChannelOffset,
            padLedControl,
            active ? 0x7F : 0x00
        );
    }
};

PioneerDDJSX.nonPadLedControl = function(deck, ledNumber, active) {
    var nonPadLedsBaseChannel = 0x90,
        midiChannelOffset = PioneerDDJSX.deckConverter(deck);

    if (midiChannelOffset !== null) {
        midi.sendShortMsg(
            nonPadLedsBaseChannel + midiChannelOffset,
            ledNumber,
            active ? 0x7F : 0x00
        );
    }
};

PioneerDDJSX.illuminateFunctionControl = function(ledNumber, active) {
    var illuminationBaseChannel = 0x9B;

    midi.sendShortMsg(
        illuminationBaseChannel,
        ledNumber,
        active ? 0x7F : 0x00
    );
};

PioneerDDJSX.wheelLedControl = function(deck, ledNumber) {
    var wheelLedBaseChannel = 0xBB,
        channel = PioneerDDJSX.deckConverter(deck);

    if (channel !== null) {
        midi.sendShortMsg(
            wheelLedBaseChannel,
            channel,
            ledNumber
        );
    }
};

PioneerDDJSX.generalLedControl = function(ledNumber, active) {
    var generalLedBaseChannel = 0x96;

    midi.sendShortMsg(
        generalLedBaseChannel,
        ledNumber,
        active ? 0x7F : 0x00
    );
};

PioneerDDJSX.updateParameterStatusLeds = function(group, statusRoll, statusLoop, statusSampler, statusSlicer) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterLeftRollMode, statusRoll & (1 << 1));
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterRightRollMode, statusRoll & 1);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterLeftGroup2Mode, statusLoop & (1 << 1));
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterRightGroup2Mode, statusLoop & 1);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterLeftSamplerMode, statusSampler & (1 << 1));
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterRightSamplerMode, statusSampler & 1);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterLeftSlicerMode, statusSlicer & (1 << 1));
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.parameterRightSlicerMode, statusSlicer & 1);
};


///////////////////////////////////////////////////////////////
//                             LEDS                          //
///////////////////////////////////////////////////////////////

PioneerDDJSX.fxAssignLeds = function(value, group, control) {
    var unit = PioneerDDJSX.fxUnitGroups[group],
        ledNumber = PioneerDDJSX.fxAssign[control];

    PioneerDDJSX.fxAssignLedControl(unit, ledNumber, PioneerDDJSX.shiftPressed, value);
};

PioneerDDJSX.fxUnitLeds = function(value, group, control) {
    PioneerDDJSX.fxLedControl(PioneerDDJSX.fxUnitGroups[group], 0x03, false, value);
};

PioneerDDJSX.fxNextChainLeds = function(value, group, control) {
    PioneerDDJSX.fxLedControl(PioneerDDJSX.fxUnitGroups[group], 0x03, true, value);
};

PioneerDDJSX.fxEffectLeds = function(value, group, control) {
    for (var index in PioneerDDJSX.fxUnitGroups) {
        if (PioneerDDJSX.fxUnitGroups.hasOwnProperty(index)) {
            var searchStr = index.replace(']', '_');
            if (group.indexOf(searchStr) !== -1) {
                PioneerDDJSX.fxLedControl(
                    PioneerDDJSX.fxUnitGroups[index],
                    PioneerDDJSX.fxEffectGroups[group],
                    false,
                    value
                );
            }
        }
    }
};

PioneerDDJSX.fxNextEffectLeds = function(value, group, control) {
    for (var index in PioneerDDJSX.fxUnitGroups) {
        if (PioneerDDJSX.fxUnitGroups.hasOwnProperty(index)) {
            var searchStr = index.replace(']', '_');
            if (group.indexOf(searchStr) !== -1) {
                PioneerDDJSX.fxLedControl(
                    PioneerDDJSX.fxUnitGroups[index],
                    PioneerDDJSX.fxEffectGroups[group],
                    true,
                    value
                );
            }
        }
    }
};

PioneerDDJSX.headphoneCueLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.headphoneCue, value);
};

PioneerDDJSX.shiftHeadphoneCueLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftHeadphoneCue, value);
};

PioneerDDJSX.shiftMasterCueLed = function(value, group, control) {
    PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds.shiftMasterCue, value);
};

PioneerDDJSX.keyLockLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.keyLock, value);
};

PioneerDDJSX.playLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.play, value);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftPlay, value);
};

PioneerDDJSX.wheelLeds = function(value, group, control) {
    var deck = PioneerDDJSX.channelGroups[group],
        duration = engine.getValue(group, "duration"),
        remainingTime = duration - (value * duration),
        speed = 0x28,
        wheelPos = 0x01;

    if (value >= 0) {
        wheelPos = 0x01 + ((speed * (value * duration)) % 0x48);
    }
    if (remainingTime > 0 && remainingTime < 30) {
        if (PioneerDDJSX.wheelLedsBlinkStatus[deck] > 2) {
            PioneerDDJSX.wheelLedsBlinkStatus[deck] = 0;
        } else {
            wheelPos = 0x00;
        }
        PioneerDDJSX.wheelLedsBlinkStatus[deck]++;
    }
    PioneerDDJSX.wheelLedControl(group, wheelPos);
};

PioneerDDJSX.cueLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.cue, value);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftCue, value);
};

PioneerDDJSX.loadLed = function(value, group, control) {
    var deck = PioneerDDJSX.channelGroups[group];
    if (value > 0) {
        PioneerDDJSX.wheelLedControl(group, 0x48);
        PioneerDDJSX.generalLedControl(PioneerDDJSX.nonPadLeds["loadDeck" + (deck + 1)], true);
        PioneerDDJSX.illuminateFunctionControl(PioneerDDJSX.illuminationControl["loadedDeck" + (deck + 1)], true);
        engine.trigger(group, "playposition");
    } else {
        PioneerDDJSX.wheelLedControl(group, 0x00);
    }
};

PioneerDDJSX.reverseLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.censor, value);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftCensor, value);
};

PioneerDDJSX.slipLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.slip, value);
};

PioneerDDJSX.quantizeLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftSync, value);
};

PioneerDDJSX.syncLed = function(value, group, control) {
    var deck = PioneerDDJSX.channelGroups[group];
    var rate = engine.getValue(group, "rate");
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.sync, value);
    if (value) {
        PioneerDDJSX.syncRate[deck] = rate;
        if (PioneerDDJSX.syncRate[deck] > 0) {
            PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.takeoverMinus, 1);
            PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.takeoverPlus, 0);
        } else if (PioneerDDJSX.syncRate[deck] < 0) {
            PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.takeoverMinus, 0);
            PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.takeoverPlus, 1);
        }
    }
    if (!value) {
        if (PioneerDDJSX.syncRate[deck] !== rate || rate === 0) {
            PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.takeoverPlus, 0);
            PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.takeoverMinus, 0);
            PioneerDDJSX.syncRate[deck] = 0;
        }
    }
};

PioneerDDJSX.autoLoopLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.autoLoop, value);
};

PioneerDDJSX.loopInLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.loopIn, value);
};

PioneerDDJSX.loopOutLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.loopOut, value);
};

PioneerDDJSX.loopExitLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftLoopOut, value);
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftAutoLoop, value);
};

PioneerDDJSX.loopHalveLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.loopHalve, value);
};

PioneerDDJSX.loopDoubleLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.loopDouble, value);
};

PioneerDDJSX.loopShiftFWLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftLoopDouble, value);
};

PioneerDDJSX.loopShiftBKWLed = function(value, group, control) {
    PioneerDDJSX.nonPadLedControl(group, PioneerDDJSX.nonPadLeds.shiftLoopHalve, value);
};

PioneerDDJSX.samplerLeds = function(value, group, control) {
    var samplerIndex = (group.replace("[Sampler", '').replace(']', '') - 1) % 8,
        sampleDeck = "[Sampler" + (samplerIndex + 1) + "]",
        padNum = PioneerDDJSX.samplerGroups[sampleDeck];

    for (var index in PioneerDDJSX.channelGroups) {
        if (PioneerDDJSX.channelGroups.hasOwnProperty(index)) {
            PioneerDDJSX.padLedControl(
                PioneerDDJSX.channelGroups[index],
                PioneerDDJSX.ledGroups.sampler,
                padNum,
                false,
                value
            );
        }
    }
};

PioneerDDJSX.samplerLedsPlay = function(value, group, control) {
    var samplerIndex = (group.replace("[Sampler", '').replace(']', '') - 1) % 8,
        sampleDeck = "[Sampler" + (samplerIndex + 1) + "]",
        padNum = PioneerDDJSX.samplerGroups[sampleDeck];

    if (!engine.getValue(sampleDeck, "duration")) {
        return;
    }

    for (var index in PioneerDDJSX.channelGroups) {
        if (PioneerDDJSX.channelGroups.hasOwnProperty(index)) {
            PioneerDDJSX.padLedControl(
                PioneerDDJSX.channelGroups[index],
                PioneerDDJSX.ledGroups.sampler,
                padNum,
                false, !value
            );
            PioneerDDJSX.padLedControl(
                PioneerDDJSX.channelGroups[index],
                PioneerDDJSX.ledGroups.sampler,
                padNum,
                true,
                value
            );
        }
    }
};

PioneerDDJSX.beatloopLeds = function(value, group, control) {
    var padNum,
        shifted = false,
        deck = PioneerDDJSX.channelGroups[group];

    for (var index in PioneerDDJSX.selectedLoopIntervals[deck]) {
        if (PioneerDDJSX.selectedLoopIntervals[deck].hasOwnProperty(index)) {
            if (control === "beatloop_" + PioneerDDJSX.selectedLoopIntervals[deck][index] + "_enabled") {
                padNum = index % 8;
                PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.group2, padNum, shifted, value);
            }
        }
    }
};

PioneerDDJSX.beatlooprollLeds = function(value, group, control) {
    var padNum,
        shifted = false,
        deck = PioneerDDJSX.channelGroups[group];

    for (var index in PioneerDDJSX.selectedLooprollIntervals[deck]) {
        if (PioneerDDJSX.selectedLooprollIntervals[deck].hasOwnProperty(index)) {
            if (control === "beatlooproll_" + PioneerDDJSX.selectedLooprollIntervals[deck][index] + "_activate") {
                padNum = index % 8;
                PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.loopRoll, padNum, shifted, value);
            }
        }
    }
};

PioneerDDJSX.hotCueLeds = function(value, group, control) {
    var padNum = null,
        hotCueNum;

    for (hotCueNum = 1; hotCueNum <= 8; hotCueNum++) {
        if (control === "hotcue_" + hotCueNum + "_enabled") {
            padNum = (hotCueNum - 1);
            PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.hotCue, padNum, false, value);
            PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.hotCue, padNum, true, value);
        }
    }
};

PioneerDDJSX.VuMeterLeds = function(value, group, control) {
    var midiBaseAdress = 0xB0,
        channel = 0x02,
        midiOut = 0x00;

    value = 1 / (1 - PioneerDDJSX.cutVumeter) * (value - PioneerDDJSX.cutVumeter);
    if (value < 0) {
        value = 0;
    }

    value = parseInt(value * 0x76); //full level indicator: 0x7F
    if (value < 0) {
        value = 0;
    }

    if (value > 0x76) {
        value = 0x76;
    }

    if (engine.getValue(group, "PeakIndicator")) {
        value = value + 0x08;
    }

    PioneerDDJSX.valueVuMeter[group + "_current"] = value;

    for (var index in PioneerDDJSX.channelGroups) {
        if (PioneerDDJSX.channelGroups.hasOwnProperty(index)) {
            midiOut = PioneerDDJSX.valueVuMeter[index + "_current"];
            if (PioneerDDJSX.twinkleVumeterAutodjOn) {
                if (engine.getValue("[AutoDJ]", "enabled")) {
                    if (PioneerDDJSX.valueVuMeter[index + "_enabled"]) {
                        midiOut = 0;
                    }
                    if (midiOut < 5 && !PioneerDDJSX.valueVuMeter[index + "_enabled"]) {
                        midiOut = 5;
                    }
                }
            }
            midi.sendShortMsg(
                midiBaseAdress + PioneerDDJSX.channelGroups[index],
                channel,
                midiOut
            );
        }
    }
};


///////////////////////////////////////////////////////////////
//                          JOGWHEELS                        //
///////////////////////////////////////////////////////////////

PioneerDDJSX.getJogWheelDelta = function(value) {
    // The Wheel control centers on 0x40; find out how much it's moved by.
    return value - 0x40;
};

PioneerDDJSX.jogRingTick = function(channel, control, value, status, group) {
    PioneerDDJSX.pitchBendFromJog(group, PioneerDDJSX.getJogWheelDelta(value));
};

PioneerDDJSX.jogRingTickShift = function(channel, control, value, status, group) {
    PioneerDDJSX.pitchBendFromJog(
        group,
        PioneerDDJSX.getJogWheelDelta(value) * PioneerDDJSX.jogwheelShiftMultiplier
    );
};

PioneerDDJSX.jogPlatterTick = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];

    if (PioneerDDJSX.gridAdjustSelected[deck]) {
        if (PioneerDDJSX.getJogWheelDelta(value) > 0) {
            script.toggleControl(group, "beats_adjust_faster");
        }
        if (PioneerDDJSX.getJogWheelDelta(value) <= 0) {
            script.toggleControl(group, "beats_adjust_slower");
        }
        return;
    }
    if (PioneerDDJSX.gridSlideSelected[deck]) {
        if (PioneerDDJSX.getJogWheelDelta(value) > 0) {
            script.toggleControl(group, "beats_translate_later");
        }
        if (PioneerDDJSX.getJogWheelDelta(value) <= 0) {
            script.toggleControl(group, "beats_translate_earlier");
        }
        return;
    }

    if (PioneerDDJSX.scratchMode[deck] && engine.isScratching(deck + 1)) {
        engine.scratchTick(deck + 1, PioneerDDJSX.getJogWheelDelta(value));
    } else {
        PioneerDDJSX.pitchBendFromJog(group, PioneerDDJSX.getJogWheelDelta(value));
    }
};

PioneerDDJSX.jogPlatterTickShift = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];

    if (PioneerDDJSX.scratchMode[deck] && engine.isScratching(deck + 1)) {
        engine.scratchTick(deck + 1, PioneerDDJSX.getJogWheelDelta(value));
    } else {
        PioneerDDJSX.pitchBendFromJog(
            group,
            PioneerDDJSX.getJogWheelDelta(value) * PioneerDDJSX.jogwheelShiftMultiplier
        );
    }
};

PioneerDDJSX.jogTouch = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];

    if (PioneerDDJSX.scratchMode[deck]) {
        if (value) {
            engine.scratchEnable(
                deck + 1,
                PioneerDDJSX.scratchSettings.jogResolution,
                PioneerDDJSX.scratchSettings.vinylSpeed,
                PioneerDDJSX.scratchSettings.alpha,
                PioneerDDJSX.scratchSettings.beta,
                true
            );
        } else {
            engine.scratchDisable(deck + 1, true);
        }
    }
};

PioneerDDJSX.toggleScratch = function(channel, control, value, status, group) {
    var deck = PioneerDDJSX.channelGroups[group];
    if (value) {
        PioneerDDJSX.scratchMode[deck] = !PioneerDDJSX.scratchMode[deck];
        PioneerDDJSX.triggerVinylLed(deck);
    }
};

PioneerDDJSX.triggerVinylLed = function(deck) {
    PioneerDDJSX.nonPadLedControl(deck, PioneerDDJSX.nonPadLeds.vinyl, PioneerDDJSX.scratchMode[deck]);
};

PioneerDDJSX.pitchBendFromJog = function(group, movement) {
    engine.setValue(group, "jog", movement / 5 * PioneerDDJSX.jogwheelSensivity);
};


///////////////////////////////////////////////////////////////
//             ROTARY SELECTOR & NAVIGATION BUTTONS          //
///////////////////////////////////////////////////////////////

PioneerDDJSX.loadPrepareButton = function(channel, control, value, status) {
    if (PioneerDDJSX.rotarySelectorChanged === true) {
        if (value) {
            engine.setValue("[PreviewDeck1]", "LoadSelectedTrackAndPlay", true);
        } else {
            if (PioneerDDJSX.jumpPreviewEnabled) {
                engine.setValue("[PreviewDeck1]", "playposition", PioneerDDJSX.jumpPreviewPosition);
            }
            PioneerDDJSX.rotarySelectorChanged = false;
        }
    } else {
        if (value) {
            if (engine.getValue("[PreviewDeck1]", "stop")) {
                script.toggleControl("[PreviewDeck1]", "play");
            } else {
                script.toggleControl("[PreviewDeck1]", "stop");
            }
        }
    }
};

PioneerDDJSX.backButton = function(channel, control, value, status) {
    if (PioneerDDJSX.useNewLibraryControls) {
        script.toggleControl("[Library]", "MoveFocusBackward");
    } else {
        script.toggleControl("AutoDJ", "skip_next");
    }
};

PioneerDDJSX.shiftBackButton = function(channel, control, value, status) {
    if (value) {
        script.toggleControl("[Master]", "maximize_library");
    }
};

PioneerDDJSX.getRotaryDelta = function(value) {
    var delta = 0x40 - Math.abs(0x40 - value),
        isCounterClockwise = value > 0x40;

    if (isCounterClockwise) {
        delta *= -1;
    }
    return delta;
};

PioneerDDJSX.rotarySelector = function(channel, control, value, status) {
    var delta = PioneerDDJSX.getRotaryDelta(value);

    if (PioneerDDJSX.useNewLibraryControls) {
        engine.setValue("[Library]", "MoveVertical", delta);
        PioneerDDJSX.rotarySelectorChanged = true;
    } else {
        engine.setValue("[Playlist]", "SelectTrackKnob", delta);
        PioneerDDJSX.rotarySelectorChanged = true;
    }
};

PioneerDDJSX.rotarySelectorShifted = function(channel, control, value, status) {
    var delta = PioneerDDJSX.getRotaryDelta(value),
        f = (delta > 0 ? "SelectNextPlaylist" : "SelectPrevPlaylist");

    if (PioneerDDJSX.useNewLibraryControls) {
        engine.setValue("[Library]", "MoveHorizontal", delta);
    } else {
        engine.setValue("[Playlist]", f, Math.abs(delta));
    }
};

PioneerDDJSX.rotarySelectorClick = function(channel, control, value, status) {
    if (PioneerDDJSX.useNewLibraryControls) {
        script.toggleControl("[Library]", "MoveFocusForward");
    } else {
        if (PioneerDDJSX.autoDJAddTop) {
            script.toggleControl("[Library]", "AutoDjAddTop");
        } else {
            script.toggleControl("[Library]", "AutoDjAddBottom");
        }
    }
};

PioneerDDJSX.rotarySelectorShiftedClick = function(channel, control, value, status) {
    if (PioneerDDJSX.useNewLibraryControls) {
        script.toggleControl("[Library]", "ChooseItem");
    } else {
        script.toggleControl("[Playlist]", "ToggleSelectedSidebarItem");
    }
};


///////////////////////////////////////////////////////////////
//                             FX                            //
///////////////////////////////////////////////////////////////

PioneerDDJSX.fxButton = function(channel, control, value, status, group) {
    var unit = channel - 4,
        effect = control - 0x47;

    if (value) {
        script.toggleControl(
            "[EffectRack1_EffectUnit" + (unit + 1) + "_Effect" + (effect + 1) + "]",
            "enabled"
        );
    }
};

PioneerDDJSX.shiftFxButton = function(channel, control, value, status, group) {
    var unit = channel - 4,
        effect = control - 0x63;

    script.toggleControl(
        "[EffectRack1_EffectUnit" + (unit + 1) + "_Effect" + (effect + 1) + "]",
        "next_effect"
    );
};

PioneerDDJSX.fxTabButton = function(channel, control, value, status, group) {
    var unit = channel - 4;

    if (value) {
        script.toggleControl("[EffectRack1_EffectUnit" + (unit + 1) + "]", "enabled");
    }
};

PioneerDDJSX.shiftFxTabButton = function(channel, control, value, status, group) {
    var unit = channel - 4;

    script.toggleControl("[EffectRack1_EffectUnit" + (unit + 1) + "]", "next_chain");
};

PioneerDDJSX.fxAssignButton = function(channel, control, value, status, group) {
    if (value) {
        if ((control >= 0x4C) && (control <= 0x4F)) {
            script.toggleControl("[EffectRack1_EffectUnit1]", "group_" + group + "_enable");
        } else if ((control >= 0x50) && (control <= 0x53)) {
            script.toggleControl("[EffectRack1_EffectUnit2]", "group_" + group + "_enable");
        }
    }
};

PioneerDDJSX.fxKnobMSB = function(channel, control, value, status) {
    PioneerDDJSX.fxKnobMSBValue[channel - 4] = value;
};

PioneerDDJSX.fxKnobLSB = function(channel, control, value, status) {
    var unit = channel - 4,
        fullValue = (PioneerDDJSX.fxKnobMSBValue[unit] << 7) + value,
        effect = ((control - 0x20) >> 1);

    engine.setParameter(
        "[EffectRack1_EffectUnit" + (unit + 1) + "_Effect" + effect + "]",
        "meta",
        fullValue / 0x3FFF
    );
};

PioneerDDJSX.shiftFxKnobMSB = function(channel, control, value, status) {
    PioneerDDJSX.shiftFxKnobMSBValue[channel - 4] = value;
};

PioneerDDJSX.shiftFxKnobLSB = function(channel, control, value, status) {
    var unit = channel - 4,
        fullValue = (PioneerDDJSX.shiftFxKnobMSBValue[unit] << 7) + value,
        parameter = ((control - 0x30) >> 1) - 1,
        fxEffectOn = false,
        parameterLoaded = false,
        group;

    for (var effect = 0; effect < 3; effect++) {
        group = "[EffectRack1_EffectUnit" + (unit + 1) + "_Effect" + (effect + 1) + "]";
        fxEffectOn = engine.getValue(group, "enabled");

        if (fxEffectOn) {
            parameterLoaded = engine.getValue(group, "parameter" + (parameter + 1) + "_loaded");
            if (parameterLoaded) {
                engine.setParameter(group, "parameter" + (parameter + 1), fullValue / 0x3FFF);
            }
        }
    }
};

PioneerDDJSX.fxBeatsKnob = function(channel, control, value, status, group) {
    var unit = channel - 4,
        delta = PioneerDDJSX.getRotaryDelta(value) / 30,
        actValue,
        newValue;

    actValue = engine.getValue("[EffectRack1_EffectUnit" + (unit + 1) + "]", "super1");
    newValue = actValue + delta;

    if (newValue >= 0.00 && newValue <= 1.00) {
        engine.setParameter("[EffectRack1_EffectUnit" + (unit + 1) + "]", "super1", newValue);
    }
};

PioneerDDJSX.shiftFxBeatsKnob = function(channel, control, value, status, group) {
    var unit = channel - 4,
        delta = PioneerDDJSX.getRotaryDelta(value) / 30,
        actValue,
        newValue;

    actValue = engine.getValue("[EffectRack1_EffectUnit" + (unit + 1) + "]", "mix");
    newValue = actValue + delta;

    if (newValue >= 0.00 && newValue <= 1.00) {
        engine.setParameter("[EffectRack1_EffectUnit" + (unit + 1) + "]", "mix", newValue);
    }
};


///////////////////////////////////////////////////////////////
//                          SLICER                           //
///////////////////////////////////////////////////////////////

PioneerDDJSX.slicerBeatActive = function(value, group, control) {
    var deck = PioneerDDJSX.channelGroups[group],
        bpm = engine.getValue(group, "bpm"),
        playposition = engine.getValue(group, "playposition"),
        duration = engine.getValue(group, "duration"),
        slicerPos = 0,
        ledBeatState = true;

    if (engine.getValue(group, "beat_closest") === engine.getValue(group, "beat_next")) {
        return;
    }

    PioneerDDJSX.slicerBeatsPassed[deck] = Math.round((playposition * duration) * (bpm / 60));
    slicerPos = PioneerDDJSX.slicerBeatsPassed[deck] % 8;

    if (PioneerDDJSX.activePadMode[deck] === PioneerDDJSX.padModes.slicer) {
        if (PioneerDDJSX.activeSlicerMode[deck] === PioneerDDJSX.slicerModes.contSlice) {
            ledBeatState = true;
        }
        if (PioneerDDJSX.activeSlicerMode[deck] === PioneerDDJSX.slicerModes.loopSlice) {
            ledBeatState = false;
            if (((PioneerDDJSX.slicerBeatsPassed[deck] - 1) % 8) === 7 && 
                  !PioneerDDJSX.slicerAlreadyJumped[deck] && 
                  PioneerDDJSX.slicerPreviousBeatsPassed[deck] < PioneerDDJSX.slicerBeatsPassed[deck]) {
                engine.setValue(group, "beatjump", -8);
                PioneerDDJSX.slicerAlreadyJumped[deck] = true;
            } else {
                PioneerDDJSX.slicerAlreadyJumped[deck] = false;
            }
        }
        for (var i = 0; i < 8; i++) {
            if (PioneerDDJSX.slicerActive[deck]) {
                if (PioneerDDJSX.slicerButton[deck] !== i) {
                    PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.slicer, i, false, (slicerPos === i) ? ledBeatState : !ledBeatState);
                }
            } else {
                PioneerDDJSX.padLedControl(group, PioneerDDJSX.ledGroups.slicer, i, false, (slicerPos === i) ? ledBeatState : !ledBeatState);
            }
        }
    } else {
        engine.setValue(group, "slip_enabled", false);
        PioneerDDJSX.slicerAlreadyJumped[deck] = false;
        PioneerDDJSX.slicerPreviousBeatsPassed[deck] = 0;
        PioneerDDJSX.slicerActive[deck] = false;
    }
};