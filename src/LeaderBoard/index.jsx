import React, { useEffect, useState } from 'react'
import styles from './leaderBoard.module.scss'

function LeaderBoard({ tokenAssets, tokenData }) {




    const getSponsorList = () => {
        let sponsorSet = new Set();

        tokenData.forEach((ele) => {
            ele['Sponsor'] && sponsorSet.add(ele['Sponsor']);
        })

        let tempList = [];

        sponsorSet.forEach((elc) => {
            let sum = 0;
            let instagrants = 0;
            let bounties = 0;
            let allotedTasks = [];
            tokenData.forEach((elx) => {
                if (elx['Sponsor'] == elc) {
                    sum = sum + parseFloat(elx['Total Earnings USD'].replace(/,/g, ''));
                    if (elx['Type'] == 'Bounty') bounties++;
                    if (elx['Type'] == 'Instagrant') instagrants++;
                    allotedTasks.push(elx);
                }
            })
            // setSponsorList((listx) => {
            //     listx['elc'] = { total: sum }
            //     return listx;
            // })
            tempList.push({ sponsor: elc, total: sum, instagrants, bounties, allotedTasks });
        })
        return tempList;
    }

    let sponsorList = Object.values(getSponsorList()).sort((a, b) => {
        return a.total - b.total;
    }).reverse();

    const [expandMore, setExpandMore] = useState(new Set());

    return (
        <div className={styles.leaderBoard}>

            <div className={styles.titles}>
                <ul>
                    <li></li>
                    <li>Sponsor</li>
                    <li>No of Grants</li>
                    <li style={{marginLeft : "1rem"}}>Total Allocation</li>
                </ul>
            </div>
            <div className={styles.body}>
                {
                    sponsorList.map((elm, id) => {
                        return (
                            <div className={styles.entry} id={styles['e' + id]} onClick={() => { expandMore.has(id) ? setExpandMore((s) => { s.delete(id); return new Set([...s]) }) : setExpandMore(new Set([...expandMore, id])) }}>
                                <ul className={styles.data}>
                                    <li>{id + 1}</li>
                                    <li>{elm['sponsor']}</li>
                                    <li className={styles.count}>{elm['instagrants'] + elm['bounties']}</li>
                                    <li className={styles.price}>$ {elm.total}</li>
                                </ul>
                                {(expandMore.has(id)) && <div className={styles.expand}>
                                    <ul className={styles.subTitle}>
                                        <li>Project</li>
                                        <li>Type</li>
                                        <li>Date Given</li>
                                        <li>allocation</li>
                                    </ul>
                                    {elm['allotedTasks'].map((itm) => {
                                        return <ul>
                                            <li>{itm['Project']}</li>
                                            <li>{itm['Type']}</li>
                                            <li>{formatDate(itm['Date Given'])}</li>
                                            <li>$ {itm['Total Earnings USD']}</li>
                                        </ul>
                                    })}
                                </div>}
                            </div>
                        )
                    })}
            </div>




        </div >
    )
}

const formatDate = (date) => {
    let dateSplit = date.split('/');
    let day = dateSplit[0];
    let month = dateSplit[1];
    let year = dateSplit[2];

    if (month.length < 2) {
        month = `0${month}`;
    }

    if (day.length < 2) {
        day = `0${month}`;
    }

    return `${day}/${month}/${year}`
}

export default LeaderBoard
