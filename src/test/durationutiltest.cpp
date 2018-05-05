#include <gtest/gtest.h>

#include "util/duration.h"

#include <QtDebug>

namespace {

class DurationUtilTest : public testing::Test {
  protected:
    static QString adjustPrecision(
        QString withMilliseconds,
        mixxx::Duration::Precision precision) {
        switch (precision) {
        case mixxx::Duration::Precision::SECONDS:
        {
            return withMilliseconds.left(withMilliseconds.length() - 4);
        }
        case mixxx::Duration::Precision::CENTISECONDS:
        {
            return withMilliseconds.left(withMilliseconds.length() - 1);
        }
        default:
            return withMilliseconds;
        }
    }

    void formatSeconds(QString expectedMilliseconds, double dSeconds) {
        ASSERT_LE(4, expectedMilliseconds.length()); // 3 digits + 1 decimal point
        const QString actualSeconds =
            mixxx::Duration::formatSeconds(dSeconds, mixxx::Duration::Precision::SECONDS);
        const QString expectedSeconds =
                adjustPrecision(expectedMilliseconds, mixxx::Duration::Precision::SECONDS);
        EXPECT_EQ(expectedSeconds, actualSeconds);
        const QString expectedCentiseconds =
                adjustPrecision(expectedMilliseconds, mixxx::Duration::Precision::CENTISECONDS);
        const QString actualCentiseconds =
            mixxx::Duration::formatSeconds(dSeconds, mixxx::Duration::Precision::CENTISECONDS);
        EXPECT_EQ(expectedCentiseconds, actualCentiseconds);
        const QString actualMilliseconds =
            mixxx::Duration::formatSeconds(dSeconds, mixxx::Duration::Precision::MILLISECONDS);
        EXPECT_EQ(actualMilliseconds, actualMilliseconds);
    }

    void formatKiloSeconds(QString expectedMilliseconds, double dSeconds) {
        ASSERT_LE(4, expectedMilliseconds.length()); // 3 digits + 1 decimal point
        const QString actualSeconds =
            mixxx::Duration::formatKiloSeconds(dSeconds, mixxx::Duration::Precision::SECONDS);
        const QString expectedSeconds =
                adjustPrecision(expectedMilliseconds, mixxx::Duration::Precision::SECONDS);
        EXPECT_EQ(expectedSeconds, actualSeconds);
        const QString expectedCentiseconds =
                adjustPrecision(expectedMilliseconds, mixxx::Duration::Precision::CENTISECONDS);
        const QString actualCentiseconds =
            mixxx::Duration::formatKiloSeconds(dSeconds, mixxx::Duration::Precision::CENTISECONDS);
        EXPECT_EQ(expectedCentiseconds, actualCentiseconds);
        const QString actualMilliseconds =
            mixxx::Duration::formatKiloSeconds(dSeconds, mixxx::Duration::Precision::MILLISECONDS);
        EXPECT_EQ(actualMilliseconds, actualMilliseconds);
    }

    void formatHectoSeconds(QString expectedMilliseconds, double dSeconds) {
        ASSERT_LE(4, expectedMilliseconds.length()); // 3 digits + 1 decimal point
        const QString actualSeconds =
            mixxx::Duration::formatHectoSeconds(dSeconds, mixxx::Duration::Precision::SECONDS);
        const QString expectedSeconds =
                adjustPrecision(expectedMilliseconds, mixxx::Duration::Precision::SECONDS);
        EXPECT_EQ(expectedSeconds, actualSeconds);
        const QString expectedCentiseconds =
                adjustPrecision(expectedMilliseconds, mixxx::Duration::Precision::CENTISECONDS);
        const QString actualCentiseconds =
            mixxx::Duration::formatHectoSeconds(dSeconds, mixxx::Duration::Precision::CENTISECONDS);
        EXPECT_EQ(expectedCentiseconds, actualCentiseconds);
        const QString actualMilliseconds =
            mixxx::Duration::formatHectoSeconds(dSeconds, mixxx::Duration::Precision::MILLISECONDS);
        EXPECT_EQ(actualMilliseconds, actualMilliseconds);
    }
};

TEST_F(DurationUtilTest, FormatSecondsNegative) {
    EXPECT_EQ("?", mixxx::Duration::formatSeconds(-1, mixxx::Duration::Precision::SECONDS));
    EXPECT_EQ("?", mixxx::Duration::formatSeconds(-1, mixxx::Duration::Precision::CENTISECONDS));
    EXPECT_EQ("?", mixxx::Duration::formatSeconds(-1, mixxx::Duration::Precision::MILLISECONDS));
}

TEST_F(DurationUtilTest, FormatSeconds) {
    formatSeconds("00:00.000", 0);
    formatSeconds("00:01.000", 1);
    formatSeconds("00:59.000", 59);
    formatSeconds("01:00.000", 60);
    formatSeconds("01:01.123", 61.1234);
    formatSeconds("59:59.999", 3599.999);
    formatSeconds("01:00:00.000", 3600);
    formatSeconds("23:59:59.000", 24 * 3600 - 1);
    formatSeconds("24:00:00.000", 24 * 3600);
    formatSeconds("24:00:01.000", 24 * 3600 + 1);
    formatSeconds("25:00:01.000", 25 * 3600 + 1);
}

TEST_F(DurationUtilTest, FormatKiloSeconds) {
    formatKiloSeconds(QString::fromUtf8("0.000\u2009000"), 0);
    formatKiloSeconds(QString::fromUtf8("0.001\u2009000"), 1);
    formatKiloSeconds(QString::fromUtf8("0.001\u2009500"), 1.5);
    formatKiloSeconds(QString::fromUtf8("0.001\u2009510"), 1.51);
    formatKiloSeconds(QString::fromUtf8("0.001\u2009490"), 1.49);
    formatKiloSeconds(QString::fromUtf8("0.059\u2009000"), 59);
    formatKiloSeconds(QString::fromUtf8("0.060\u2009000"), 60);
    formatKiloSeconds(QString::fromUtf8("0.061\u2009123"), 61.1234);
    formatKiloSeconds(QString::fromUtf8("0.999\u2009990"), 999.99);
    formatKiloSeconds(QString::fromUtf8("1.000\u2009000"), 1000.00);
    formatKiloSeconds(QString::fromUtf8("86.400\u2009000"), 24 * 3600);
}

TEST_F(DurationUtilTest, FormatHectoSeconds) {
    formatHectoSeconds(QString::fromUtf8("0.00\u2009000"), 0);
    formatHectoSeconds(QString::fromUtf8("0.01\u2009000"), 1);
    formatHectoSeconds(QString::fromUtf8("0.01\u2009500"), 1.5);
    formatHectoSeconds(QString::fromUtf8("0.01\u2009510"), 1.51);
    formatHectoSeconds(QString::fromUtf8("0.01\u2009490"), 1.49);
    formatHectoSeconds(QString::fromUtf8("0.59\u2009000"), 59);
    formatHectoSeconds(QString::fromUtf8("0.60\u2009000"), 60);
    formatHectoSeconds(QString::fromUtf8("0.61\u2009123"), 61.1234);
    formatHectoSeconds(QString::fromUtf8("9.99\u2009990"), 999.99);
    formatHectoSeconds(QString::fromUtf8("10.00\u2009000"), 1000.00);
    formatHectoSeconds(QString::fromUtf8("864.00\u2009000"), 24 * 3600);
}


} // anonymous namespace
