#include <dsp/keydetection/GetKeyMode.h>

// Class header comes after library includes here since our preprocessor
// definitions interfere with qm-dsp's headers.
#include "analyzer/plugins/analyzerqueenmarykey.h"

#include "util/math.h"

using mixxx::track::io::key::ChromaticKey;
using mixxx::track::io::key::ChromaticKey_IsValid;

namespace {
// Window length in chroma frames. Default value from VAMP plugin.
int kChromaWindowLength = 10;

// Tuning frequency of concert A in Hertz. Default value from VAMP plugin.
int kTuningFrequencyHertz = 440;

}  // namespace

AnalyzerQueenMaryKey::AnalyzerQueenMaryKey()
        : m_currentFrame(0),
          m_prevKey(mixxx::track::io::key::INVALID) {
}

AnalyzerQueenMaryKey::~AnalyzerQueenMaryKey() {
}

bool AnalyzerQueenMaryKey::initialize(int samplerate) {
    m_prevKey = mixxx::track::io::key::INVALID;
    m_resultKeys.clear();
    m_currentFrame = 0;
    m_pKeyMode.reset(new GetKeyMode(samplerate, kTuningFrequencyHertz,
                                    kChromaWindowLength, kChromaWindowLength));
    size_t blockSize = m_pKeyMode->getBlockSize();
    size_t stepSize = m_pKeyMode->getHopSize();
    return m_helper.initialize(
        blockSize, stepSize,
        [this](double* pBlock, size_t) {
            const int iKey = m_pKeyMode->process(pBlock);

            // Should not happen.
            if (!ChromaticKey_IsValid(iKey)) {
                return false;
            }
            const auto key = static_cast<ChromaticKey>(iKey);
            if (key != m_prevKey) {
                // TODO(rryan) reserve?
                m_resultKeys.push_back(qMakePair(
                    key, static_cast<double>(m_currentFrame)));
                m_prevKey = key;
            }
            return true;
        });
}

bool AnalyzerQueenMaryKey::process(const CSAMPLE* pIn, const int iLen) {
    DEBUG_ASSERT(iLen % 2 == 0);
    if (m_pKeyMode.isNull()) {
        return false;
    }

    const size_t numInputFrames = iLen / 2;
    bool result = m_helper.processStereoSamples(pIn, iLen);

    m_currentFrame += numInputFrames;
    return result;
}

bool AnalyzerQueenMaryKey::finalize() {
    // TODO(rryan) do we need a flush?
    m_helper.finalize();
    m_pKeyMode.reset();
    return true;
}
