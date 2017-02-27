/**
* @file encodermp3settings.cpp
* @author Josep Maria Antolín
* @date Feb 27 2017
* @brief storage of setting for mp3 encoder
*/

#include "encoder/encodermp3settings.h"
#include "recording/defs_recording.h"

#define DEFAULT_BITRATE_INDEX 6

EncoderMp3Settings::EncoderMp3Settings(UserSettingsPointer pConfig) :
    m_pConfig(pConfig)
{
    // Added "32" because older settings started at index 1 with 48.
    m_qualList.append(32);
    m_qualList.append(48);
    m_qualList.append(64);
    m_qualList.append(80);
    m_qualList.append(96);
    m_qualList.append(112);
    m_qualList.append(128);
    m_qualList.append(160);
    m_qualList.append(192);
    m_qualList.append(224);
    m_qualList.append(256);
    m_qualList.append(320);
    m_pConfig = m_pConfig;
}
EncoderMp3Settings::~EncoderMp3Settings()
{
    
}


QList<int> EncoderMp3Settings::getQualityValues() const
{
    return m_qualList;
}

// Sets the value
void EncoderMp3Settings::setQualityByValue(int qualityValue) 
{
    if (m_qualList.contains(qualityValue)) {
        m_pConfig->set(ConfigKey(RECORDING_PREF_KEY, "MP3_Quality"), 
                ConfigValue(m_qualList.indexOf(qualityValue)));
    } else {
        qWarning() << "Invalid qualityValue given to EncoderMp3Settings: " 
            << qualityValue << ". Ignoring it";
    }
}

void EncoderMp3Settings::setQualityByIndex(int qualityIndex)
{
    if (qualityIndex >= 0 && qualityIndex < m_qualList.size()) {
        m_pConfig->set(ConfigKey(RECORDING_PREF_KEY, "MP3_Quality"), ConfigValue(qualityIndex));
    } else {
        qWarning() << "Invalid qualityIndex given to EncoderMp3Settings: " 
            << qualityIndex << ". Ignoring it";
    }
}

int EncoderMp3Settings::getQuality() const
{
    return m_qualList.at(getQualityIndex());
}
int EncoderMp3Settings::getQualityIndex() const
{
    int qualityIndex = m_pConfig->getValue(
            ConfigKey(RECORDING_PREF_KEY, "MP3_Quality"), DEFAULT_BITRATE_INDEX);
    if (qualityIndex >= 0 && qualityIndex < m_qualList.size()) {
        return qualityIndex;
    }
    else {
        qWarning() << "Invalid qualityIndex in EncoderMp3Settings " 
            << qualityIndex << ". Ignoring it and returning default";
    }
    return DEFAULT_BITRATE_INDEX;
}
