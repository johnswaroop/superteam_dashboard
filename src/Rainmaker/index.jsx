import React, { useEffect, useState } from 'react'
import styles from './leaderBoard.module.scss'

function separator(numb) {
    var str = numb.toString().split(".");
    str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return str.join(".");
}

function LeaderBoard({ tokenAssets, tokenData }) {

    const getSponsorList = () => {
        let sponsorSet = new Set();

        tokenData.forEach((ele) => {
            ele['Rainmaker'] && sponsorSet.add(ele['Rainmaker']);
        })

        let tempList = [];

        sponsorSet.forEach((elc) => {
            let sum = 0;
            let instagrants = 0;
            let bounties = 0;
            let allotedTasks = [];
            tokenData.forEach((elx) => {
                if (elx['Rainmaker'] == elc) {
                    let total_usd = elx['Total Earnings USD'];
                    total_usd = total_usd.replace(/,/g, '');
                    total_usd = total_usd.replace('$', '')

                    sum = sum + parseFloat(total_usd);
                    if (elx['Type'] == 'Bounty') bounties++;
                    if (elx['Type'] == 'Instagrant') instagrants++;
                    allotedTasks.push(elx);
                }
            })
            sum = sum.toFixed(0);
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
                    <li>Rainmaker</li>
                    <li></li>
                    <li style={{ marginLeft: "1rem" }}>Total Amount</li>
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
                                    <li className={styles.count}></li>
                                    <li className={styles.price}>$ {separator(elm.total)}</li>
                                </ul>
                                {(expandMore.has(id)) && <div className={styles.expand}>
                                    <ul className={styles.subTitle}>
                                        <li>Project</li>
                                        <li>Type</li>
                                        <li>Date Given</li>
                                        <li>Project Fund</li>
                                    </ul>
                                    {elm['allotedTasks'].map((itm) => {
                                        return <ul>
                                            <li>{itm['Project']}</li>
                                            <li>{itm['Type']}</li>
                                            <li>{formatDate(itm['Date Given'])}</li>
                                            <li>$ {separator(itm['Total Earnings USD'].replace('$', ''))}</li>
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

    if (`${month.length}` < 2) {
        month = `0${month}`;
    }

    if (`${day.length}` < 2) {
        day = `0${day}`;
    }

    return `${day}/${month}/${year}`
}

export default LeaderBoard
