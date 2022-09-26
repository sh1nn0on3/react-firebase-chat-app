import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthProvider";

function useFirestore(collectionName, condition) {
  const [documents, setDocuments] = useState([]);
  const { uid } = useContext(AuthContext);

  // Lấy dữ liệu người dùng mỗi khi thêm vào database
  // Realtime database
  useEffect(() => {
    if (condition) {
      if (!condition.compareValue || !condition.compareValue.length) {
        console.log("End useFirestore!");
        return;
      }
    }

    if (uid) {
      let collectionRef = collection(db, collectionName);

      const q = query(
        collectionRef,
        where(condition.fielName, condition.operator, condition.compareValue),
        orderBy("createAt")
      );

      // onSnapshot
      // mỗi lần dữ liệu trong database được thay đổi thì nó
      // sẽ thực hiện cập nhật dữ liệu cho snapshot
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // Respond to data
          // ...
          // Lặp qua snapshot để lấy mảng dữ liệu
          const documents = snapshot.docs.map((doc) => {
            let data = doc.data();
            let docId = doc.id;

            return {
              ...data,
              id: docId,
            };
          });

          setDocuments(documents);
        },
        (error) => {
          console.error(error);
          // alert(
          //   "Thông báo: Hiện tại ứng dụng đã hết lượt truy cập. Vui lòng thử lại sau 😵‍💫"
          // );
        }
      );

      // Cleanup function
      return () => {
        console.log("Clean up useFirestore: ", collectionName);
        unsubscribe();
      };
    }
  }, [collectionName, condition, uid]);

  return documents;
}

export default useFirestore;
