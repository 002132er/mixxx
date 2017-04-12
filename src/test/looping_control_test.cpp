#include <gtest/gtest.h>

#include <QtDebug>
#include <QScopedPointer>

#include "mixxxtest.h"
#include "control/controlobject.h"
#include "control/controlpushbutton.h"
#include "control/controlproxy.h"
#include "engine/loopingcontrol.h"
#include "test/mockedenginebackendtest.h"
#include "util/memory.h"

class LoopingControlTest : public MockedEngineBackendTest {
  public:
    LoopingControlTest()
            : kTrackLengthSamples(300000000) {
    }

  protected:
    void SetUp() override {
        MockedEngineBackendTest::SetUp();
        m_pQuantizeEnabled = std::make_unique<ControlProxy>(m_sGroup1, "quantize");
        m_pQuantizeEnabled->set(1.0);
        m_pNextBeat = std::make_unique<ControlProxy>(m_sGroup1, "beat_next");

        m_pNextBeat->set(-1);
        m_pClosestBeat = std::make_unique<ControlProxy>(m_sGroup1, "beat_closest");
        m_pClosestBeat->set(-1);
        m_pTrackSamples = std::make_unique<ControlProxy>(m_sGroup1, "track_samples");
        m_pTrackSamples->set(kTrackLengthSamples);
        m_pButtonLoopIn = std::make_unique<ControlProxy>(m_sGroup1, "loop_in");
        m_pButtonLoopOut = std::make_unique<ControlProxy>(m_sGroup1, "loop_out");
        m_pButtonLoopExit = std::make_unique<ControlProxy>(m_sGroup1, "loop_exit");
        m_pButtonReloop = std::make_unique<ControlProxy>(m_sGroup1, "reloop");
        m_pButtonReloopAndStop = std::make_unique<ControlProxy>(m_sGroup1, "reloop_andstop");
        m_pButtonReloopToggle = std::make_unique<ControlProxy>(m_sGroup1, "reloop_toggle");
        m_pButtonLoopDouble = std::make_unique<ControlProxy>(m_sGroup1, "loop_double");
        m_pButtonLoopHalve = std::make_unique<ControlProxy>(m_sGroup1, "loop_halve");
        m_pLoopEnabled = std::make_unique<ControlProxy>(m_sGroup1, "loop_enabled");
        m_pLoopStartPoint = std::make_unique<ControlProxy>(m_sGroup1, "loop_start_position");
        m_pLoopEndPoint = std::make_unique<ControlProxy>(m_sGroup1, "loop_end_position");
        m_pButtonPlay = std::make_unique<ControlProxy>(m_sGroup1, "play");
        m_pPlayPosition = std::make_unique<ControlProxy>(m_sGroup1, "playposition");
        m_pButtonBeatMoveForward = std::make_unique<ControlProxy>(m_sGroup1, "loop_move_1_forward");
        m_pButtonBeatMoveBackward = std::make_unique<ControlProxy>(m_sGroup1, "loop_move_1_backward");
        m_pButtonBeatLoop2Activate = std::make_unique<ControlProxy>(m_sGroup1, "beatloop_2_activate");
        m_pButtonBeatLoop4Activate = std::make_unique<ControlProxy>(m_sGroup1, "beatloop_4_activate");
        m_pBeatLoop2Enabled = std::make_unique<ControlProxy>(m_sGroup1, "beatloop_2_enabled");
        m_pBeatLoop4Enabled = std::make_unique<ControlProxy>(m_sGroup1, "beatloop_4_enabled");
        m_pBeatLoop64Enabled = std::make_unique<ControlProxy>(m_sGroup1, "beatloop_64_enabled");
        m_pBeatLoop = std::make_unique<ControlProxy>(m_sGroup1, "beatloop");
        m_pBeatLoopSize = std::make_unique<ControlProxy>(m_sGroup1, "beatloop_size");
        m_pButtonBeatLoopDouble = std::make_unique<ControlProxy>(m_sGroup1, "beatloop_double");
        m_pButtonBeatLoopHalve = std::make_unique<ControlProxy>(m_sGroup1, "beatloop_halve");
        m_pButtonBeatLoopToggle = std::make_unique<ControlProxy>(m_sGroup1, "beatloop_toggle");
    }

    bool isLoopEnabled() {
        return m_pLoopEnabled->get() > 0.0;
    }

    void seekToSampleAndProcess(double new_pos) {
        m_pChannel1->getEngineBuffer()->queueNewPlaypos(new_pos, EngineBuffer::SEEK_STANDARD);
        ProcessBuffer();
    }

    const int kTrackLengthSamples;
    std::unique_ptr<ControlProxy> m_pNextBeat;
    std::unique_ptr<ControlProxy> m_pClosestBeat;
    std::unique_ptr<ControlProxy> m_pQuantizeEnabled;
    std::unique_ptr<ControlProxy> m_pTrackSamples;
    std::unique_ptr<ControlProxy> m_pButtonLoopIn;
    std::unique_ptr<ControlProxy> m_pButtonLoopOut;
    std::unique_ptr<ControlProxy> m_pButtonLoopExit;
    std::unique_ptr<ControlProxy> m_pButtonReloop;
    std::unique_ptr<ControlProxy> m_pButtonReloopAndStop;
    std::unique_ptr<ControlProxy> m_pButtonReloopToggle;
    std::unique_ptr<ControlProxy> m_pButtonLoopDouble;
    std::unique_ptr<ControlProxy> m_pButtonLoopHalve;
    std::unique_ptr<ControlProxy> m_pLoopEnabled;
    std::unique_ptr<ControlProxy> m_pLoopStartPoint;
    std::unique_ptr<ControlProxy> m_pLoopEndPoint;
    std::unique_ptr<ControlProxy> m_pPlayPosition;
    std::unique_ptr<ControlProxy> m_pButtonPlay;
    std::unique_ptr<ControlProxy> m_pButtonBeatMoveForward;
    std::unique_ptr<ControlProxy> m_pButtonBeatMoveBackward;
    std::unique_ptr<ControlProxy> m_pButtonBeatLoop2Activate;
    std::unique_ptr<ControlProxy> m_pButtonBeatLoop4Activate;
    std::unique_ptr<ControlProxy> m_pBeatLoop2Enabled;
    std::unique_ptr<ControlProxy> m_pBeatLoop4Enabled;
    std::unique_ptr<ControlProxy> m_pBeatLoop64Enabled;
    std::unique_ptr<ControlProxy> m_pBeatLoop;
    std::unique_ptr<ControlProxy> m_pBeatLoopSize;
    std::unique_ptr<ControlProxy> m_pButtonBeatLoopDouble;
    std::unique_ptr<ControlProxy> m_pButtonBeatLoopHalve;
    std::unique_ptr<ControlProxy> m_pButtonBeatLoopToggle;
};

TEST_F(LoopingControlTest, LoopSet) {
    m_pLoopStartPoint->slotSet(0);
    m_pLoopEndPoint->slotSet(100);
    seekToSampleAndProcess(50);
    EXPECT_FALSE(isLoopEnabled());
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(100, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopSetOddSamples) {
    m_pLoopStartPoint->slotSet(1);
    m_pLoopEndPoint->slotSet(101);
    seekToSampleAndProcess(50);
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(100, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopInSetInsideLoopContinues) {
    m_pLoopStartPoint->slotSet(0);
    m_pLoopEndPoint->slotSet(100);
    m_pButtonReloopToggle->slotSet(1);
    m_pButtonReloopToggle->slotSet(0);
    seekToSampleAndProcess(50);
    EXPECT_TRUE(isLoopEnabled());
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(100, m_pLoopEndPoint->get());
    m_pLoopStartPoint->slotSet(10);
    EXPECT_TRUE(isLoopEnabled());
    EXPECT_EQ(10, m_pLoopStartPoint->get());
    EXPECT_EQ(100, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopInSetAfterLoopOutStops) {
    m_pLoopStartPoint->slotSet(0);
    m_pLoopEndPoint->slotSet(100);
    m_pButtonReloopToggle->slotSet(1);
    m_pButtonReloopToggle->slotSet(0);
    seekToSampleAndProcess(50);
    EXPECT_TRUE(isLoopEnabled());
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(100, m_pLoopEndPoint->get());
    m_pLoopStartPoint->slotSet(110);
    EXPECT_FALSE(isLoopEnabled());
    EXPECT_EQ(110, m_pLoopStartPoint->get());
    EXPECT_EQ(-1, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopOutSetInsideLoopContinues) {
    m_pLoopStartPoint->slotSet(0);
    m_pLoopEndPoint->slotSet(100);
    m_pButtonReloopToggle->slotSet(1);
    m_pButtonReloopToggle->slotSet(0);
    seekToSampleAndProcess(50);
    EXPECT_TRUE(isLoopEnabled());
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(100, m_pLoopEndPoint->get());
    m_pLoopEndPoint->slotSet(80);
    EXPECT_TRUE(isLoopEnabled());
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(80, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopOutSetBeforeLoopInIgnored) {
    m_pLoopStartPoint->slotSet(10);
    m_pLoopEndPoint->slotSet(100);
    m_pButtonReloopToggle->slotSet(1);
    m_pButtonReloopToggle->slotSet(0);
    seekToSampleAndProcess(50);
    EXPECT_TRUE(isLoopEnabled());
    EXPECT_EQ(10, m_pLoopStartPoint->get());
    EXPECT_EQ(100, m_pLoopEndPoint->get());
    m_pLoopEndPoint->slotSet(0);
    EXPECT_TRUE(isLoopEnabled());
    EXPECT_EQ(10, m_pLoopStartPoint->get());
    EXPECT_EQ(100, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopInButton_QuantizeDisabled) {
    m_pQuantizeEnabled->set(0);
    m_pClosestBeat->set(100);
    m_pNextBeat->set(100);
    seekToSampleAndProcess(50);
    m_pButtonLoopIn->slotSet(1);
    m_pButtonLoopIn->slotSet(0);
    ProcessBuffer();
    EXPECT_EQ(50, m_pLoopStartPoint->get());
}

TEST_F(LoopingControlTest, LoopInButton_QuantizeEnabledNoBeats) {
    m_pQuantizeEnabled->set(1);
    m_pClosestBeat->set(-1);
    m_pNextBeat->set(-1);
    seekToSampleAndProcess(50);
    m_pButtonLoopIn->slotSet(1);
    m_pButtonLoopIn->slotSet(0);
    EXPECT_EQ(50, m_pLoopStartPoint->get());
}

TEST_F(LoopingControlTest, LoopInButton_QuantizeEnabledClosestBeat) {
    m_pQuantizeEnabled->set(1);
    m_pClosestBeat->set(100);
    m_pNextBeat->set(110);
    seekToSampleAndProcess(50);
    m_pButtonLoopIn->slotSet(1);
    m_pButtonLoopIn->slotSet(0);
    EXPECT_EQ(100, m_pLoopStartPoint->get());
}

TEST_F(LoopingControlTest, LoopInButton_AdjustLoopInPointOutsideLoop) {
    m_pLoopStartPoint->slotSet(1000);
    m_pLoopEndPoint->slotSet(2000);
    m_pButtonReloopToggle->slotSet(1);
    m_pButtonReloopToggle->slotSet(0);
    m_pButtonLoopIn->slotSet(1);
    seekToSampleAndProcess(50);
    m_pButtonLoopIn->slotSet(0);
    EXPECT_EQ(50, m_pLoopStartPoint->get());
}

TEST_F(LoopingControlTest, LoopInButton_AdjustLoopInPointInsideLoop) {
    m_pLoopStartPoint->slotSet(1000);
    m_pLoopEndPoint->slotSet(2000);
    m_pButtonReloopToggle->slotSet(1);
    m_pButtonReloopToggle->slotSet(0);
    m_pButtonLoopIn->slotSet(1);
    seekToSampleAndProcess(1500);
    m_pButtonLoopIn->slotSet(0);
    EXPECT_EQ(1500, m_pLoopStartPoint->get());
}

TEST_F(LoopingControlTest, LoopOutButton_QuantizeDisabled) {
    m_pQuantizeEnabled->set(0);
    m_pClosestBeat->set(1000);
    m_pNextBeat->set(1000);
    seekToSampleAndProcess(500);
    m_pLoopStartPoint->slotSet(0);
    m_pButtonLoopOut->slotSet(1);
    m_pButtonLoopOut->slotSet(0);
    EXPECT_EQ(500, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopOutButton_QuantizeEnabledNoBeats) {
    m_pQuantizeEnabled->set(1);
    m_pClosestBeat->set(-1);
    m_pNextBeat->set(-1);
    seekToSampleAndProcess(500);
    m_pLoopStartPoint->slotSet(0);
    m_pButtonLoopOut->slotSet(1);
    m_pButtonLoopOut->slotSet(0);
    EXPECT_EQ(500, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopOutButton_QuantizeEnabledClosestBeat) {
    m_pQuantizeEnabled->set(1);
    m_pClosestBeat->set(1000);
    m_pNextBeat->set(1100);
    seekToSampleAndProcess(500);
    m_pLoopStartPoint->slotSet(0);
    m_pButtonLoopOut->slotSet(1);
    m_pButtonLoopOut->slotSet(0);
    EXPECT_EQ(1000, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopOutButton_AdjustLoopOutPointOutsideLoop) {
    m_pLoopStartPoint->slotSet(1000);
    m_pLoopEndPoint->slotSet(2000);
    m_pButtonReloopToggle->slotSet(1);
    m_pButtonReloopToggle->slotSet(0);
    m_pButtonLoopOut->slotSet(1);
    seekToSampleAndProcess(3000);
    m_pButtonLoopOut->slotSet(0);
    EXPECT_EQ(3000, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopOutButton_AdjustLoopOutPointInsideLoop) {
    m_pLoopStartPoint->slotSet(100);
    m_pLoopEndPoint->slotSet(2000);
    m_pButtonReloopToggle->slotSet(1);
    m_pButtonReloopToggle->slotSet(0);
    m_pButtonLoopOut->slotSet(1);
    seekToSampleAndProcess(1500);
    m_pButtonLoopOut->slotSet(0);
    EXPECT_EQ(1500, m_pLoopEndPoint->get());
}


TEST_F(LoopingControlTest, ReloopToggleButton_TogglesLoop) {
    m_pQuantizeEnabled->set(0);
    m_pClosestBeat->set(-1);
    m_pNextBeat->set(-1);
    seekToSampleAndProcess(500);
    m_pLoopStartPoint->slotSet(0);
    m_pButtonLoopOut->slotSet(1);
    m_pButtonLoopOut->slotSet(0);
    EXPECT_TRUE(isLoopEnabled());
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(500, m_pLoopEndPoint->get());
    m_pButtonReloopToggle->slotSet(1);
    m_pButtonReloopToggle->slotSet(0);
    EXPECT_FALSE(isLoopEnabled());
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(500, m_pLoopEndPoint->get());
    m_pButtonReloopToggle->slotSet(1);
    m_pButtonReloopToggle->slotSet(0);
    EXPECT_TRUE(isLoopEnabled());
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(500, m_pLoopEndPoint->get());
    // Ensure that the Loop Exit button works, and that it doesn't act as a
    // toggle.
    m_pButtonLoopExit->slotSet(1);
    m_pButtonLoopExit->slotSet(0);
    EXPECT_FALSE(isLoopEnabled());
    m_pButtonLoopExit->slotSet(1);
    m_pButtonLoopExit->slotSet(0);
    EXPECT_FALSE(isLoopEnabled());
}

TEST_F(LoopingControlTest, ReloopButton_PressedBeforeLoop) {
    m_pLoopStartPoint->slotSet(1000);
    m_pLoopEndPoint->slotSet(2000);
    seekToSampleAndProcess(0);

    m_pButtonReloop->slotSet(1);
    m_pButtonReloop->slotSet(0);
    seekToSampleAndProcess(50);
    EXPECT_LE(m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample(), m_pLoopStartPoint->get());
}

TEST_F(LoopingControlTest, ReloopButton_PressedAfterLoop) {
    m_pLoopStartPoint->slotSet(1000);
    m_pLoopEndPoint->slotSet(2000);
    seekToSampleAndProcess(3000);

    m_pButtonReloop->slotSet(1);
    m_pButtonReloop->slotSet(0);
    ProcessBuffer();
    EXPECT_EQ(m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample(), m_pLoopStartPoint->get());
    EXPECT_FALSE(m_pButtonPlay->toBool());
    EXPECT_TRUE(m_pLoopEnabled->toBool());
}

TEST_F(LoopingControlTest, ReloopButton_PressedInDisabledLoop) {
    m_pLoopStartPoint->slotSet(1000);
    m_pLoopEndPoint->slotSet(2000);
    seekToSampleAndProcess(1500);

    m_pButtonReloop->slotSet(1);
    m_pButtonReloop->slotSet(0);
    ProcessBuffer();
    EXPECT_EQ(m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample(), 1500);
    EXPECT_TRUE(m_pLoopEnabled->toBool());
}

TEST_F(LoopingControlTest, ReloopButton_LoopEnabled) {
    m_pLoopStartPoint->slotSet(1000);
    m_pLoopEndPoint->slotSet(2000);
    seekToSampleAndProcess(1500);
    m_pButtonReloopToggle->slotSet(1);
    m_pButtonReloopToggle->slotSet(0);
    m_pButtonReloop->slotSet(1);
    m_pButtonReloop->slotSet(0);
    ProcessBuffer();
    EXPECT_EQ(m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample(), m_pLoopStartPoint->get());
    EXPECT_TRUE(m_pLoopEnabled->toBool());
}

TEST_F(LoopingControlTest, ReloopAndStopButton) {
    m_pLoopStartPoint->slotSet(1000);
    m_pLoopEndPoint->slotSet(2000);
    seekToSampleAndProcess(1500);
    m_pButtonReloopToggle->slotSet(1);
    m_pButtonReloopToggle->slotSet(0);
    m_pButtonReloopAndStop->slotSet(1);
    m_pButtonReloopAndStop->slotSet(0);
    ProcessBuffer();
    EXPECT_EQ(m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample(), m_pLoopStartPoint->get());
    EXPECT_TRUE(m_pLoopEnabled->toBool());
}

TEST_F(LoopingControlTest, LoopDoubleButton_DoublesLoop) {
    seekToSampleAndProcess(0);
    m_pButtonLoopIn->set(1);
    m_pButtonLoopIn->set(0);
    seekToSampleAndProcess(500);
    m_pButtonLoopOut->set(1);
    m_pButtonLoopOut->set(0);
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(500, m_pLoopEndPoint->get());
    m_pButtonLoopDouble->slotSet(1);
    m_pButtonLoopDouble->slotSet(0);
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(1000, m_pLoopEndPoint->get());
    m_pButtonLoopDouble->slotSet(1);
    m_pButtonLoopDouble->slotSet(0);
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(2000, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopDoubleButton_IgnoresPastTrackEnd) {
    seekToSampleAndProcess(50);
    m_pLoopStartPoint->slotSet(kTrackLengthSamples / 2.0);
    m_pLoopEndPoint->slotSet(kTrackLengthSamples);
    EXPECT_EQ(kTrackLengthSamples / 2.0, m_pLoopStartPoint->get());
    EXPECT_EQ(kTrackLengthSamples, m_pLoopEndPoint->get());
    m_pButtonLoopDouble->slotSet(1);
    m_pButtonLoopDouble->slotSet(0);
    EXPECT_EQ(kTrackLengthSamples / 2.0, m_pLoopStartPoint->get());
    EXPECT_EQ(kTrackLengthSamples, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopDoubleButton_DoublesBeatloopSizeForPowerOf2Sizes) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(16.0);
    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    m_pButtonLoopDouble->set(1.0);
    m_pButtonLoopDouble->set(0.0);
    EXPECT_EQ(32.0, m_pBeatLoopSize->get());
}

TEST_F(LoopingControlTest, LoopDoubleButton_DoesNotDoubleBeatloopSizeForManualLoop) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(8.0);
    seekToSampleAndProcess(500);
    m_pButtonLoopIn->set(1.0);
    m_pButtonLoopIn->set(0.0);
    seekToSampleAndProcess(1000);
    m_pButtonLoopOut->set(1.0);
    m_pButtonLoopOut->set(0.0);
    m_pButtonLoopDouble->slotSet(1);
    m_pButtonLoopDouble->slotSet(0);
    EXPECT_EQ(8.0, m_pBeatLoopSize->get());
}

TEST_F(LoopingControlTest, LoopDoubleButton_UpdatesNumberedBeatloopActivationControls) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(2.0);
    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    EXPECT_TRUE(m_pBeatLoop2Enabled->toBool());
    EXPECT_FALSE(m_pBeatLoop4Enabled->toBool());

    m_pButtonLoopDouble->set(1.0);
    m_pButtonLoopDouble->set(0.0);
    EXPECT_FALSE(m_pBeatLoop2Enabled->toBool());
    EXPECT_TRUE(m_pBeatLoop4Enabled->toBool());
}

TEST_F(LoopingControlTest, LoopHalveButton_HalvesLoop) {
    m_pLoopStartPoint->slotSet(0);
    m_pLoopEndPoint->slotSet(2000);
    seekToSampleAndProcess(1800);
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(2000, m_pLoopEndPoint->get());
    EXPECT_EQ(1800, m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample());
    EXPECT_FALSE(isLoopEnabled());
    m_pButtonLoopHalve->slotSet(1);
    m_pButtonLoopHalve->slotSet(0);
    ProcessBuffer();
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(1000, m_pLoopEndPoint->get());

    // The loop was not enabled so halving the loop should not move the playhead
    // even though it is outside the loop.
    EXPECT_EQ(1800, m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample());

    m_pButtonReloopToggle->slotSet(1);
    EXPECT_TRUE(isLoopEnabled());
    m_pButtonLoopHalve->slotSet(1);
    m_pButtonLoopHalve->slotSet(0);
    ProcessBuffer();
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(500, m_pLoopEndPoint->get());
    // Since the current sample was out of range of the new loop,
    // the current sample should reseek based on the new loop size.
    EXPECT_EQ(300, m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample());
}

TEST_F(LoopingControlTest, LoopHalveButton_IgnoresTooSmall) {
    ProcessBuffer();
    m_pLoopStartPoint->slotSet(0);
    m_pLoopEndPoint->slotSet(40);
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(40, m_pLoopEndPoint->get());
    m_pButtonLoopHalve->slotSet(1);
    m_pButtonLoopHalve->slotSet(0);
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(40, m_pLoopEndPoint->get());
}

TEST_F(LoopingControlTest, LoopHalveButton_HalvesBeatloopSizeForPowerOf2Sizes) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(64.0);
    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    m_pButtonLoopHalve->slotSet(1);
    m_pButtonLoopHalve->slotSet(0);
    EXPECT_EQ(32.0, m_pBeatLoopSize->get());
}

TEST_F(LoopingControlTest, LoopHalveButton_DoesNotHalveBeatloopSizeForManualLoop) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(64.0);
    seekToSampleAndProcess(500);
    m_pButtonLoopIn->set(1.0);
    m_pButtonLoopIn->set(0.0);
    seekToSampleAndProcess(1000);
    m_pButtonLoopOut->set(1.0);
    m_pButtonLoopOut->set(0.0);
    m_pButtonLoopHalve->slotSet(1);
    m_pButtonLoopHalve->slotSet(0);
    EXPECT_EQ(64.0, m_pBeatLoopSize->get());
}

TEST_F(LoopingControlTest, LoopHalveButton_UpdatesNumberedBeatloopActivationControls) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(4.0);
    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    EXPECT_FALSE(m_pBeatLoop2Enabled->toBool());
    EXPECT_TRUE(m_pBeatLoop4Enabled->toBool());

    m_pButtonLoopHalve->set(1.0);
    m_pButtonLoopHalve->set(0.0);
    EXPECT_TRUE(m_pBeatLoop2Enabled->toBool());
    EXPECT_FALSE(m_pBeatLoop4Enabled->toBool());
}

TEST_F(LoopingControlTest, LoopMoveTest) {
    // Set a crazy bpm so our super-short track of 1000 samples has a couple beats in it.
    m_pTrack1->setBpm(23520);
    m_pLoopStartPoint->slotSet(0);
    m_pLoopEndPoint->slotSet(300);
    seekToSampleAndProcess(10);
    m_pButtonReloopToggle->slotSet(1);
    EXPECT_TRUE(isLoopEnabled());
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(300, m_pLoopEndPoint->get());
    EXPECT_EQ(10, m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample());

    // Move the loop out from under the playposition.
    m_pButtonBeatMoveForward->set(1.0);
    m_pButtonBeatMoveForward->set(0.0);
    ProcessBuffer();
    EXPECT_EQ(224, m_pLoopStartPoint->get());
    EXPECT_EQ(524, m_pLoopEndPoint->get());
    EXPECT_EQ(310, m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample());

    // Move backward so that the current position is off the end of the loop.
    m_pChannel1->getEngineBuffer()->queueNewPlaypos(500, EngineBuffer::SEEK_STANDARD);
    ProcessBuffer();
    m_pButtonBeatMoveBackward->set(1.0);
    m_pButtonBeatMoveBackward->set(0.0);
    ProcessBuffer();
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(300, m_pLoopEndPoint->get());
    EXPECT_EQ(200, m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample());

    // Now repeat the test with looping disabled (should not affect the
    // playhead).
    m_pButtonReloopToggle->slotSet(1);
    EXPECT_FALSE(isLoopEnabled());

    // Move the loop out from under the playposition.
    m_pButtonBeatMoveForward->set(1.0);
    m_pButtonBeatMoveForward->set(0.0);
    ProcessBuffer();
    EXPECT_EQ(224, m_pLoopStartPoint->get());
    EXPECT_EQ(524, m_pLoopEndPoint->get());
    EXPECT_EQ(200, m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample());

    // Move backward so that the current position is off the end of the loop.
    m_pChannel1->getEngineBuffer()->queueNewPlaypos(500, EngineBuffer::SEEK_STANDARD);
    ProcessBuffer();
    m_pButtonBeatMoveBackward->set(1.0);
    m_pButtonBeatMoveBackward->set(0.0);
    ProcessBuffer();
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(300, m_pLoopEndPoint->get());
    EXPECT_EQ(500, m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample());
}

TEST_F(LoopingControlTest, LoopResizeSeek) {
    // Activating a new loop with a loop active should warp the playposition
    // the same as it does when we scale the loop larger and smaller so we
    // keep in sync with the beat.

    // Disable quantize for this test
    m_pQuantizeEnabled->set(0.0);

    m_pTrack1->setBpm(23520);
    m_pLoopStartPoint->slotSet(0);
    m_pLoopEndPoint->slotSet(600);
    seekToSampleAndProcess(500);
    m_pButtonReloopToggle->slotSet(1);
    EXPECT_TRUE(isLoopEnabled());
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(600, m_pLoopEndPoint->get());
    EXPECT_EQ(500, m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample());

    // Activate a shorter loop
    m_pButtonBeatLoop2Activate->set(1.0);

    ProcessBuffer();

    // The loop is resized and we should have seeked to a mid-beat part of the
    // loop.
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(450, m_pLoopEndPoint->get());
    EXPECT_EQ(50, m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample());

    // But if looping is not enabled, no warping occurs.
    m_pLoopStartPoint->slotSet(0);
    m_pLoopEndPoint->slotSet(600);
    seekToSampleAndProcess(500);
    m_pButtonReloopToggle->slotSet(1);
    EXPECT_FALSE(isLoopEnabled());
    EXPECT_EQ(0, m_pLoopStartPoint->get());
    EXPECT_EQ(600, m_pLoopEndPoint->get());
    EXPECT_EQ(500, m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample());

    m_pButtonBeatLoop2Activate->set(1.0);
    ProcessBuffer();

    EXPECT_EQ(500, m_pLoopStartPoint->get());
    EXPECT_EQ(950, m_pLoopEndPoint->get());
    EXPECT_EQ(500, m_pChannel1->getEngineBuffer()->m_pLoopingControl->getCurrentSample());
}

TEST_F(LoopingControlTest, BeatLoopSize_SetAndToggle) {
    m_pTrack1->setBpm(120.0);
    // Setting beatloop_size should not activate a loop
    m_pBeatLoopSize->set(2.0);
    EXPECT_FALSE(m_pLoopEnabled->toBool());

    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    EXPECT_TRUE(m_pLoopEnabled->toBool());
    EXPECT_TRUE(m_pBeatLoop2Enabled->toBool());

    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    EXPECT_FALSE(m_pLoopEnabled->toBool());
    EXPECT_FALSE(m_pBeatLoop2Enabled->toBool());
}

TEST_F(LoopingControlTest, BeatLoopSize_SetWithoutTrackLoaded) {
    // Eject the track that is automatically loaded by the testing framework
    m_pChannel1->getEngineBuffer()->slotEjectTrack(1.0);
    m_pBeatLoopSize->set(5.0);
    EXPECT_EQ(5.0, m_pBeatLoopSize->get());
}

TEST_F(LoopingControlTest, BeatLoopSize_IgnoresPastTrackEnd) {
    // TODO: actually calculate that the beatloop would go beyond
    // the end of the track
    m_pTrack1->setBpm(60.0);
    seekToSampleAndProcess(m_pTrackSamples->get() - 400);
    m_pBeatLoopSize->set(64.0);
    EXPECT_NE(64.0, m_pBeatLoopSize->get());
    EXPECT_FALSE(m_pBeatLoop64Enabled->toBool());
}

TEST_F(LoopingControlTest, BeatLoopSize_SetsNumberedControls) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(2.0);
    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    EXPECT_TRUE(m_pBeatLoop2Enabled->toBool());
    EXPECT_FALSE(m_pBeatLoop4Enabled->toBool());

    m_pBeatLoopSize->set(4.0);
    EXPECT_FALSE(m_pBeatLoop2Enabled->toBool());
    EXPECT_TRUE(m_pBeatLoop4Enabled->toBool());
    EXPECT_TRUE(m_pLoopEnabled->toBool());
}

TEST_F(LoopingControlTest, BeatLoopSize_IsSetByNumberedControl) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(4.0);
    m_pButtonBeatLoop2Activate->set(1.0);
    m_pButtonBeatLoop2Activate->set(0.0);
    EXPECT_TRUE(m_pBeatLoop2Enabled->toBool());
    EXPECT_TRUE(m_pLoopEnabled->toBool());
    EXPECT_EQ(2.0, m_pBeatLoopSize->get());

    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    EXPECT_FALSE(m_pBeatLoop2Enabled->toBool());
    EXPECT_FALSE(m_pLoopEnabled->toBool());
    EXPECT_EQ(2.0, m_pBeatLoopSize->get());
}

TEST_F(LoopingControlTest, BeatLoopSize_SetDoesNotStartLoop) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(16.0);
    EXPECT_FALSE(m_pLoopEnabled->toBool());
}

TEST_F(LoopingControlTest, BeatLoopSize_ResizeKeepsStartPosition) {
    seekToSampleAndProcess(50);
    m_pTrack1->setBpm(160.0);
    m_pBeatLoopSize->set(2.0);
    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    double oldStart = m_pLoopStartPoint->get();

    ProcessBuffer();

    m_pBeatLoopSize->set(1.0);
    EXPECT_TRUE(m_pLoopEnabled->toBool());
    double newStart = m_pLoopStartPoint->get();
    EXPECT_TRUE(oldStart == newStart);
}

TEST_F(LoopingControlTest, BeatLoopSize_ValueChangeDoesNotActivateLoop) {
    seekToSampleAndProcess(50);
    m_pTrack1->setBpm(160.0);
    m_pBeatLoopSize->set(2.0);
    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    EXPECT_TRUE(m_pLoopEnabled->toBool());

    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    EXPECT_FALSE(m_pLoopEnabled->toBool());
    m_pBeatLoopSize->set(4.0);
    EXPECT_FALSE(m_pLoopEnabled->toBool());
    EXPECT_FALSE(m_pBeatLoop4Enabled->toBool());
}

TEST_F(LoopingControlTest, BeatLoopSize_ValueChangeResizesBeatLoop) {
    seekToSampleAndProcess(50);
    m_pTrack1->setBpm(160.0);
    m_pBeatLoopSize->set(2.0);
    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    EXPECT_TRUE(m_pLoopEnabled->toBool());
    double oldLoopStart = m_pLoopStartPoint->get();
    double oldLoopEnd = m_pLoopEndPoint->get();
    double oldLoopLength = oldLoopEnd - oldLoopStart;

    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    EXPECT_FALSE(m_pLoopEnabled->toBool());
    m_pBeatLoopSize->set(4.0);

    double newLoopStart = m_pLoopStartPoint->get();
    double newLoopEnd = m_pLoopEndPoint->get();
    double newLoopLength = newLoopEnd - newLoopStart;
    EXPECT_EQ(oldLoopStart, newLoopStart);
    EXPECT_NE(oldLoopEnd, newLoopEnd);
    EXPECT_EQ(oldLoopLength * 2, newLoopLength);
}

TEST_F(LoopingControlTest, BeatLoopSize_ValueChangeDoesNotResizeManualLoop) {
    seekToSampleAndProcess(50);
    m_pTrack1->setBpm(160.0);
    m_pBeatLoopSize->set(4.0);
    m_pButtonLoopIn->slotSet(1);
    m_pButtonLoopIn->slotSet(0);
    seekToSampleAndProcess(500);
    m_pButtonLoopOut->slotSet(1);
    m_pButtonLoopOut->slotSet(0);
    EXPECT_TRUE(m_pLoopEnabled->toBool());
    double oldLoopStart = m_pLoopStartPoint->get();
    double oldLoopEnd = m_pLoopEndPoint->get();
    double oldLoopLength = oldLoopEnd - oldLoopStart;

    m_pButtonBeatLoopToggle->set(1.0);
    m_pButtonBeatLoopToggle->set(0.0);
    EXPECT_FALSE(m_pLoopEnabled->toBool());
    m_pBeatLoopSize->set(8.0);

    double newLoopStart = m_pLoopStartPoint->get();
    double newLoopEnd = m_pLoopEndPoint->get();
    double newLoopLength = newLoopEnd - newLoopStart;
    EXPECT_EQ(oldLoopStart, newLoopStart);
    EXPECT_EQ(oldLoopEnd, newLoopEnd);
    EXPECT_EQ(oldLoopLength, newLoopLength);
}

TEST_F(LoopingControlTest, BeatLoopDoubleButton_DoublesBeatloopSize) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(3.0);
    m_pButtonBeatLoopDouble->set(1.0);
    m_pButtonBeatLoopDouble->set(0.0);
    EXPECT_EQ(6.0, m_pBeatLoopSize->get());
}

TEST_F(LoopingControlTest, BeatLoopDoubleButton_DoublesBeatloopSizeWhenNoLoopIsSet) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(64.0);
    m_pLoopStartPoint->set(kNoTrigger);
    m_pLoopEndPoint->set(kNoTrigger);
    m_pButtonBeatLoopDouble->slotSet(1);
    m_pButtonBeatLoopDouble->slotSet(0);
    EXPECT_EQ(128.0, m_pBeatLoopSize->get());
}

TEST_F(LoopingControlTest, BeatLoopHalveButton_HalvesBeatloopSize) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(6.0);
    m_pButtonBeatLoopHalve->set(1.0);
    m_pButtonBeatLoopHalve->set(0.0);
    EXPECT_EQ(3.0, m_pBeatLoopSize->get());
}

TEST_F(LoopingControlTest, BeatLoopHalveButton_HalvesBeatloopSizeWhenNoLoopIsSet) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoopSize->set(64.0);
    m_pLoopStartPoint->set(kNoTrigger);
    m_pLoopEndPoint->set(kNoTrigger);
    m_pButtonBeatLoopHalve->slotSet(1);
    m_pButtonBeatLoopHalve->slotSet(0);
    EXPECT_EQ(32.0, m_pBeatLoopSize->get());
}

TEST_F(LoopingControlTest, LegacyBeatLoopControl) {
    m_pTrack1->setBpm(120.0);
    m_pBeatLoop->set(2.0);
    EXPECT_TRUE(m_pBeatLoop2Enabled->toBool());
    EXPECT_TRUE(m_pLoopEnabled->toBool());
    EXPECT_EQ(2.0, m_pBeatLoopSize->get());

    m_pButtonReloopToggle->set(1.0);
    m_pButtonReloopToggle->set(0.0);
    EXPECT_FALSE(m_pBeatLoop2Enabled->toBool());
    EXPECT_FALSE(m_pLoopEnabled->toBool());
    EXPECT_EQ(2.0, m_pBeatLoopSize->get());

    ProcessBuffer();

    m_pBeatLoop->set(6.0);
    EXPECT_TRUE(m_pLoopEnabled->toBool());
    EXPECT_EQ(6.0, m_pBeatLoopSize->get());
}
