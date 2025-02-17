import React, { useEffect, useState } from "react";
import { ReactComponent as Check } from "images/check.svg";
import { ReactComponent as FilledStar } from "images/star-filled.svg";
import { ReactComponent as EmptyStar } from "images/star-empty.svg";
import Pagination from "./Pagination";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./fbase/fbase";
import { ListStyle } from "./styled";
import { useNavigate } from "react-router-dom";

export default function List(props) {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [allData, setAllData] = useState();
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);

  const filter = async (code, num, pageIndex = 1) => {
    let filteredArray;
    if (code == "") {
      setAllData(props.data);
      filteredArray = props.data.slice(num * (pageIndex - 1), num * pageIndex);
    } else {
      filteredArray = await props.data.filter((d) => d.SIGUN_CD == code);
      setAllData(filteredArray);
      filteredArray = filteredArray.slice(
        num * (pageIndex - 1),
        num * pageIndex
      );
    }
    setFilteredData(filteredArray);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!props.isLoading) {
      if (props.city != undefined) {
        filter(props.city, props.number, page);
      } else {
        filter("", props.number, page);
      }
    }
  }, [props.isLoading, props.city, props.number, page]);

  const manageWishlist = async (event, item) => {
    const target = event.currentTarget;
    if (sessionStorage.getItem("uid") == null) {
      alert("로그인을 먼저 해주세요!");
      navigate("/login");
    } else {
      try {
        const obj = target.getAttribute("name");
        const userRef = doc(db, "users", sessionStorage.getItem("uid"));
        const userSnap = await getDoc(userRef);
        const userObjSnap = userSnap.data()[obj];
        if (userSnap.data()[obj] == undefined) {
          await setDoc(
            userRef,
            {
              [obj]: [],
            },
            {
              merge: true,
            }
          );
        }
        if (obj == "hospital" || obj == "pharmacy") {
          if (userObjSnap != undefined) {
            const search = await userObjSnap.filter(
              (i) => i.name == item.BIZPLC_NM && i.date == item.LICENSG_DE
            );
            if (search.length > 0) {
              await updateDoc(userRef, {
                [obj]: arrayRemove({
                  name: item.BIZPLC_NM,
                  date: item.LICENSG_DE,
                  zip: item.REFINE_ZIP_CD,
                  address: item.REFINE_ROADNM_ADDR,
                  tel: item.LOCPLC_FACLT_TELNO,
                  lat: item.REFINE_WGS84_LAT,
                  lon: item.REFINE_WGS84_LOGT,
                }),
              });
            } else {
              await updateDoc(userRef, {
                [obj]: arrayUnion({
                  name: item.BIZPLC_NM,
                  date: item.LICENSG_DE,
                  zip: item.REFINE_ZIP_CD,
                  address: item.REFINE_ROADNM_ADDR,
                  tel: item.LOCPLC_FACLT_TELNO,
                  lat: item.REFINE_WGS84_LAT,
                  lon: item.REFINE_WGS84_LOGT,
                }),
              });
            }
          } else {
            await updateDoc(userRef, {
              [obj]: arrayUnion({
                name: item.BIZPLC_NM,
                date: item.LICENSG_DE,
                zip: item.REFINE_ZIP_CD,
                address: item.REFINE_ROADNM_ADDR,
                tel: item.LOCPLC_FACLT_TELNO,
                lat: item.REFINE_WGS84_LAT,
                lon: item.REFINE_WGS84_LOGT,
              }),
            });
          }
        } else if (obj == "shelter") {
          if (userObjSnap != undefined) {
            const search = await userObjSnap.filter(
              (i) => i.name == item.ENTRPS_NM
            );
            if (search.length > 0) {
              await updateDoc(userRef, {
                [obj]: arrayRemove({
                  name: item.ENTRPS_NM,
                  zip: item.REFINE_ZIP_CD,
                  address: item.REFINE_ROADNM_ADDR,
                  tel: item.ENTRPS_TELNO,
                  lat: item.REFINE_WGS84_LAT,
                  lon: item.REFINE_WGS84_LOGT,
                }),
              });
            } else {
              await updateDoc(userRef, {
                [obj]: arrayUnion({
                  name: item.ENTRPS_NM,
                  zip: item.REFINE_ZIP_CD,
                  address: item.REFINE_ROADNM_ADDR,
                  tel: item.ENTRPS_TELNO,
                  lat: item.REFINE_WGS84_LAT,
                  lon: item.REFINE_WGS84_LOGT,
                }),
              });
            }
          } else {
            await updateDoc(userRef, {
              [obj]: arrayUnion({
                name: item.ENTRPS_NM,
                zip: item.REFINE_ZIP_CD,
                address: item.REFINE_ROADNM_ADDR,
                tel: item.ENTRPS_TELNO,
                lat: item.REFINE_WGS84_LAT,
                lon: item.REFINE_WGS84_LOGT,
              }),
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <ListStyle>
      {!isLoading ? (
        <>
          <div className="list-box">
            {(props.hospital || props.pharmacy) &&
              filteredData.map((item, index) => {
                return (
                  <div
                    key={`${item.BIZPLC_NM} ${item.LICENSG_DE}`}
                    className="list"
                    onClick={() =>
                      props.setCenter({
                        lat: item.REFINE_WGS84_LAT,
                        lon: item.REFINE_WGS84_LOGT,
                      })
                    }
                  >
                    <h3 className="name">{item.BIZPLC_NM}</h3>
                    <p className="address">{`[${item.REFINE_ZIP_CD}] ${item.REFINE_ROADNM_ADDR}`}</p>
                    <p className="tel">{item.LOCPLC_FACLT_TELNO}</p>
                    <button
                      name={`${
                        props.pharmacy
                          ? "pharmacy"
                          : props.hospital
                          ? "hospital"
                          : ""
                      }`}
                      className="star"
                      index={index}
                      onClick={(event) => manageWishlist(event, item)}
                    >
                      {/* <FilledStar fill="#FFCB00" /> */}
                      <EmptyStar className="icon star" />
                    </button>
                  </div>
                );
              })}
            {props.shelter &&
              filteredData.map((item) => {
                return (
                  <div
                    key={`${item.ENTRPS_NM} ${item.SIGUN_CD}`}
                    className="list"
                    onClick={() =>
                      props.setCenter({
                        lat: item.REFINE_WGS84_LAT,
                        lon: item.REFINE_WGS84_LOGT,
                      })
                    }
                  >
                    <h3 className="name">
                      {item.CONTRACT_PERD == "직영" && (
                        <span className="check">
                          <Check className="icon check" />
                        </span>
                      )}
                      {item.ENTRPS_NM}
                    </h3>

                    <p className="address">{`[${item.REFINE_ZIP_CD}] ${item.REFINE_ROADNM_ADDR}`}</p>
                    <p className="tel">{item.ENTRPS_TELNO}</p>
                    <button
                      name="shelter"
                      className="star"
                      onClick={(event) => manageWishlist(event, item)}
                    >
                      {/* <FilledStar fill="#FFCB00" /> */}
                      <EmptyStar className="icon star" />
                    </button>
                  </div>
                );
              })}
          </div>
          <Pagination
            data={allData}
            number={props.number}
            page={page}
            setPage={setPage}
          />
        </>
      ) : null}
    </ListStyle>
  );
}
