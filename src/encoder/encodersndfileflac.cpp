/****************************************************************************
                   encoderwave.cpp  -  vorbis encoder for mixxx
                             -------------------
    copyright            : (C) 2017 by Josep Maria Antolín
 ***************************************************************************/

/***************************************************************************
 *                                                                         *
 *   This program is free software; you can redistribute it and/or modify  *
 *   it under the terms of the GNU General Public License as published by  *
 *   the Free Software Foundation; either version 2 of the License, or     *
 *   (at your option) any later version.                                   *
 *                                                                         *
 ***************************************************************************/

#include <QtDebug>

#include "encoder/encodersndfileflac.h"

#include "encoder/encodercallback.h"


EncoderSndfileFlac::EncoderSndfileFlac(EncoderCallback* pCallback)
    :EncoderWave(pCallback) {
}

EncoderSndfileFlac::~EncoderSndfileFlac() {
}

void EncoderSndfileFlac::setEncoderSettings(const EncoderSettings& settings)
{
    m_sfInfo.format = SF_FORMAT_FLAC;

    int radio = settings.getSelectedOption(EncoderFlacSettings::BITS_GROUP);
    switch(radio) {
        case 0:
            m_sfInfo.format |= SF_FORMAT_PCM_16;
            break;
        case 1:
            m_sfInfo.format |= SF_FORMAT_PCM_24;
            break;
        default:
            m_sfInfo.format |= SF_FORMAT_PCM_16;
            qWarning() << " Unexpected radio index on setEncoderSettings: " 
                    << radio << ". reverting to Flac 16bits";
            break;
    }
    
    m_compression = static_cast<double>(settings.getCompression()) / 8.0;
}

void EncoderSndfileFlac::initStream() {
    EncoderWave::initStream();
    // Tell the compression setting to use.
    sf_command(m_pSndfile, SFC_SET_COMPRESSION_LEVEL, &m_compression, sizeof(double));
}
