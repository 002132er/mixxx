#include "analyzer/analyzersilence.h"
#include "util/audiosignal.h"

namespace {
    const SINT kChannelCount = mixxx::AudioSignal::kChannelCountStereo;
    const float kSilenceThresholdDb = -60.0f;
}  // anonymous namespace

AnalyzerSilence::AnalyzerSilence(UserSettingsPointer pConfig)
    : m_pConfig(pConfig),
      m_fThreshold(db2ratio(kSilenceThresholdDb)),
      m_iFramesProcessed(0),
      m_bPrevSilence(true),
      m_iSignalBegin(-1),
      m_iSignalEnd(-1) {
}

AnalyzerSilence::~AnalyzerSilence() {
}

bool AnalyzerSilence::initialize(TrackPointer tio, int sampleRate, int totalSamples) {
    Q_UNUSED(sampleRate);
    Q_UNUSED(totalSamples);

    m_iFramesProcessed = 0;
    m_bPrevSilence = true;
    m_iSignalBegin = -1;
    m_iSignalEnd = -1;

    m_pBeginCue = tio->findCueByType(Cue::BEGIN);
    if (!m_pBeginCue) {
        m_pBeginCue = tio->createAndAddCue();
        m_pBeginCue->setType(Cue::BEGIN);
        m_pBeginCue->setSource(Cue::AUTOMATIC);
        m_pBeginCue->setPosition(-1.0);
    }

    m_pEndCue = tio->findCueByType(Cue::END);
    if (!m_pEndCue) {
        m_pEndCue = tio->createAndAddCue();
        m_pEndCue->setType(Cue::END);
        m_pEndCue->setSource(Cue::AUTOMATIC);
        m_pEndCue->setPosition(-1.0);
    }

    return !isDisabledOrLoadStoredSuccess(tio);
}

bool AnalyzerSilence::isDisabledOrLoadStoredSuccess(TrackPointer tio) const {
    Q_UNUSED(tio);

    return m_pBeginCue->getSource() == Cue::MANUAL && m_pEndCue->getSource() == Cue::MANUAL;
}

void AnalyzerSilence::process(const CSAMPLE* pIn, const int iLen) {
    for (int i = 0; i < iLen; i += kChannelCount) {
        // Compute max of channels in this sample frame
        CSAMPLE fMax = CSAMPLE_ZERO;
        for (SINT ch = 0; ch < kChannelCount; ++ch) {
            CSAMPLE fAbs = fabs(pIn[i + ch]);
            fMax = math_max(fMax, fAbs);
        }

        bool bSilence = fMax < m_fThreshold;

        if (m_bPrevSilence && !bSilence) {
            if (m_iSignalBegin < 0) {
                m_iSignalBegin = m_iFramesProcessed + i / kChannelCount;
            }
        } else if (!m_bPrevSilence && bSilence) {
            m_iSignalEnd = m_iFramesProcessed + i / kChannelCount;
        }

        m_bPrevSilence = bSilence;
    }

    m_iFramesProcessed += iLen / kChannelCount;
}

void AnalyzerSilence::cleanup(TrackPointer tio) {
    Q_UNUSED(tio);
}

void AnalyzerSilence::finalize(TrackPointer tio) {
    Q_UNUSED(tio);

    if (m_iSignalBegin < 0) {
        m_iSignalBegin = 0;
    }
    if (m_iSignalEnd < 0) {
        m_iSignalEnd = m_iFramesProcessed;
    }

    // If track didn't end with silence, place signal end marker
    // on the end of the track.
    if (!m_bPrevSilence) {
        m_iSignalEnd = m_iFramesProcessed;
    }

    if (m_pBeginCue->getSource() != Cue::MANUAL) {
        m_pBeginCue->setPosition(kChannelCount * m_iSignalBegin);
    }

    if (m_pEndCue->getSource() != Cue::MANUAL) {
        m_pEndCue->setPosition(kChannelCount * m_iSignalEnd);
    }
}
