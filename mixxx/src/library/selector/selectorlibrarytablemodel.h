// Created 3/17/2012 by Keith Salisbury (keithsalisbury@gmail.com)

#ifndef SELECTORLIBRARYTABLEMODEL_H_
#define SELECTORLIBRARYTABLEMODEL_H_

#include <QModelIndexList>
#include "library/librarytablemodel.h"
#include "controlobjectthreadmain.h"


class ControlObjectThreadMain;

class SelectorLibraryTableModel : public LibraryTableModel
{
    Q_OBJECT
  public:
    SelectorLibraryTableModel(QObject* parent, TrackCollection* pTrackCollection);
    virtual ~SelectorLibraryTableModel();

    virtual void search(const QString& searchText);
    virtual bool isColumnInternal(int column);
    virtual int rowCount();

  public slots:
    void filterByGenre(bool value);
    void filterByBpm(bool value, int range);
    void filterByYear(bool value);
    void filterByRating(bool value);
    void filterByKey(bool value);
    void filterByHarmonicKey(bool value);

    /*
    void updateFilter(
        bool filterByGenre, 
        bool filterByBpm,
        bool filterByYear,
        bool filterByRating,
        bool filterByKey,
        bool filterByHarmonicKey
        );
        */
  private slots:
    void slotSearch(const QString& searchText);
    void slotPlayingDeckChanged(int deck);
    void slotChannel1BpmChanged(double value);
    void slotFiltersChanged();
  signals:
    void filtersChanged();
    void doSearch(const QString& searchText);
  private:

    void updateFilterText();
    QString adjustPitchBy(QString pitch, int change);
    void setRate();
    float m_rate;
    bool m_bFilterGenre;
    bool m_bFilterBpm;
    int m_iFilterBpmRange;
    bool m_bFilterYear;
    bool m_bFilterRating;
    bool m_bFilterKey;
    bool m_bFilterHarmonicKey;

    QStringList m_semitoneList;
    QStringList m_majors;
    QStringList m_minors;

    QString m_pChannel;
    QString m_filtersText;
    TrackPointer m_pLoadedTrack;
    ControlObjectThreadMain* m_channelBpm;
    void initializeHarmonicsData();
    QString getHarmonicKeys(QStringList key1, QStringList key2, QString key) const;

};




#endif



