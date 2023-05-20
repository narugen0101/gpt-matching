import React, { useState, useEffect, createContext, useContext } from "react";
import { auth, db, storage } from "../../firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import Prefectures from "../../components/Prefectures";
import "daisyui/dist/full.css";

export const UserProfileContext = createContext({
  setHasUserProfile: () => {},
});

export default function UserProfile() {
  const userProfileContext = useContext(UserProfileContext);
  const { setHasUserProfile } = userProfileContext;
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const edit = location.state?.edit || false;
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [photo1, setPhoto1] = useState(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [hometown, setHometown] = useState("");
  const [bio, setBio] = useState("");
  const [remainingPhotos, setRemainingPhotos] = useState(Array(4).fill(null));
  const [photo1Preview, setPhoto1Preview] = useState(null);
  const [gender, setGender] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (edit && user) {
        const userDocRef = db.collection("users").doc(user.uid);
        const userDoc = await userDocRef.get();
        const userData = userDoc.data();
        setName(userData.name || "");
        setBirthdate(userData.birthdate || "");
        setBirthdate(userData.birthdate || "");
        setPhoto1(userData.photo1 || null);
        setHeight(userData.height || "");
        setGender(userData.gender || "");
        setHometown(userData.hometown || "");
        setBio(userData.bio || "");
        setRemainingPhotos(userData.remainingPhotos || Array(3).fill(null));
        // userData.photo1のURLをphoto1Previewにセット
        setPhoto1Preview(userData.photo1 || null);
      }
    };
    fetchUserData();
  }, [edit, user]);

  function displayImage(file) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto1Preview(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  const removePhoto1 = () => {
    setPhoto1(null);
    setPhoto1Preview(null);
  };

  const uploadImage = async (uid, file) => {
    const filePath = `users/${uid}/${file.name}`;
    const storageRef = storage.ref(filePath);
    await storageRef.put(file);
    const downloadURL = await storageRef.getDownloadURL();
    return downloadURL;
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      setPhoto1(e.target.files[0]);
      displayImage(e.target.files[0]);
    };
    input.click();
  };

  const handleRemainingImageUpload = (index) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const updatedRemainingPhotos = [...remainingPhotos];
      updatedRemainingPhotos[index] = e.target.files[0];
      setRemainingPhotos(updatedRemainingPhotos);
    };
    input.click();
  };

  const removeRemainingPhoto = (index) => {
    setRemainingPhotos((prevPhotos) => {
      const newPhotos = [...prevPhotos];
      newPhotos[index] = null;
      return newPhotos;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    try {
      let photo1URL = photo1Preview;
      if (photo1 && typeof photo1 !== "string") {
        photo1URL = await uploadImage(user.uid, photo1);
      }
      const uploadedRemainingPhotos = await Promise.all(
        remainingPhotos.map(async (photo, index) => {
          if (photo && typeof photo !== "string") {
            const photoURL = await uploadImage(user.uid, photo);
            return photoURL;
          } else {
            return photo;
          }
        })
      ).then((results) => results.filter((photo) => photo !== null));

      const userDocRef = db.collection("users").doc(user.uid);
      await userDocRef.set(
        {
          name,
          birthdate,
          photo1: photo1URL,
          height,
          weight,
          hometown,
          bio,
          remainingPhotos: uploadedRemainingPhotos,
          gender,
        },
        { merge: true }
      );
      setHasUserProfile(true);
      navigate("/home");
      window.location.reload();
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-10">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <div className="card bg-primary text-primary-content mt-300 mb-20 w-4/5">
          <ul className="steps p-4">
            <li
              className={step === 1 ? "step step-info" : "step"}
              onClick={() => user && setStep(1)}
            ></li>
            <li
              className={step === 2 ? "step step-info" : "step"}
              onClick={() => user && setStep(2)}
            ></li>
            <li
              className={step === 3 ? "step step-info" : "step"}
              onClick={() => user && setStep(3)}
            ></li>
          </ul>
          {step === 1 && (
            <div className="p-4">
              <h2 className="text-center">Step 1</h2>
              <form onSubmit={handleSubmit}>
                <div className="name">
                  <h2 className="name mb-2">名前の入力</h2>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={`input input-bordered input-primary w-full max-w-xs mb-2 ${
                      !name && "input-error"
                    }`}
                  />
                </div>
                <div className="birthdate">
                  <h2 className="mb-2">誕生日の入力</h2>
                  <input
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    required
                    className={`input input-bordered input-primary w-full max-w-xs mb-2 ${
                      !birthdate && "input-error"
                    }`}
                  />
                </div>
                <div className="gender">
                  <h2 className="mb-2">性別の選択</h2>
                  <div
                    className={`flex items-center space-x-4 mb-2 ${
                      !gender && "radio-error mp-2"
                    }`}
                  >
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        className="radio"
                        onChange={(e) => setGender(e.target.value)}
                        checked={gender === "male"}
                        required
                      />
                      <span className="ml-2">男性</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        className="radio radio-secondary"
                        onChange={(e) => setGender(e.target.value)}
                        checked={gender === "female"}
                        required
                      />
                      <span className="ml-2">女性</span>
                    </label>
                  </div>
                </div>
                <div className="photo1">
                  <h2 className="mb-2">あなたのことがわかる写真1枚</h2>
                  {photo1Preview ? (
                    <div className="relative w-full">
                      <img
                        src={photo1Preview}
                        alt="プレビュー画像"
                        className="mb-2 h-48 w-full object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        className="btn btn-outline absolute top-0 right-0"
                        onClick={removePhoto1}
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`btn btn-outline ${
                        !photo1Preview && "btn-error"
                      }`}
                      onClick={handleImageUpload}
                    >
                      写真をアップロード
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
          <div>
            {step === 2 && (
              <>
                <div className="p-4">
                  <h2 className="text-center">Step 2</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="height">
                      <h2 className="mb-2">あなたの身長</h2>
                      <select
                        className="select select-bordered mb-2"
                        value={height || ""}
                        onChange={(e) => setHeight(e.target.value)}
                      >
                        <option value="" disabled>
                          身長を選択
                        </option>
                        {Array.from({ length: 111 }, (_, i) => 140 + i).map(
                          (heightValue) => (
                            <option key={heightValue} value={heightValue}>
                              {heightValue} cm
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div className="weight">
                      <h2 className="mb-2">あなたの体重</h2>
                      <div className="form-control">
                        <div className="input-group mb-2">
                          <select
                            className="select select-bordered"
                            value={weight || ""}
                            onChange={(e) => setWeight(e.target.value)}
                          >
                            <option value="" disabled>
                              体重を選択
                            </option>
                            <option>痩せ型</option>
                            <option>ほっそり</option>
                            <option>筋肉質</option>
                            <option>ふくよか</option>
                            <option>丸っこい</option>
                            <option>ぽっちゃり</option>
                            <option>太め</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="hometown">
                      <h2 className="mb-2">あなたの住んでいる都道府県</h2>
                      <div className="form-control">
                        <div className="input-group mb-2">
                          <select
                            className="select select-bordered"
                            value={hometown || ""}
                            onChange={(e) => setHometown(e.target.value)}
                          >
                            <option value="" disabled>
                              都道府県を選択
                            </option>
                            {Prefectures.PREF_OPTIONS.map((option) => {
                              return (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="bio">
                      <h2 className="mb-2">あなたの自己紹介</h2>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="textarea textarea-bordered textarea-primary w-full max-w-xs h-36 mb-2"
                      />
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
          <div>
            {step === 3 && (
              <div className="p-4">
                <h2 className="text-center">Step 3</h2>
                <form onSubmit={handleSubmit}>
                  <div className="remaining-photos">
                    <h2 className="mb-2 text-center">
                      あなたのことがわかる写真4枚
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 4 }, (_, i) => i).map((index) => {
                        const photo = remainingPhotos[index];

                        return (
                          <div key={index} className="mb-2 relative">
                            {photo && typeof photo === "object" ? (
                              <>
                                <img
                                  src={URL.createObjectURL(photo)}
                                  alt={`プレビュー画像 ${index + 1}`}
                                  className="h-48 w-full object-cover rounded-xl"
                                />
                                <button
                                  type="button"
                                  className="btn btn-outline absolute top-0 right-0"
                                  onClick={() => removeRemainingPhoto(index)}
                                >
                                  X
                                </button>
                              </>
                            ) : photo ? (
                              <>
                                <img
                                  src={photo}
                                  alt={`プレビュー画像 ${index + 1}`}
                                  className="h-48 w-full object-cover rounded-xl"
                                />
                                <button
                                  type="button"
                                  className="btn btn-outline absolute top-0 right-0"
                                  onClick={() => removeRemainingPhoto(index)}
                                >
                                  X
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-outline w-full h-48 flex items-center justify-center border-2 border-dashed rounded-xl"
                                onClick={() =>
                                  handleRemainingImageUpload(index)
                                }
                              >
                                写真を追加
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 p-4 flex justify-between">
            {step > 1 && step < 4 ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleBack}
              >
                戻る
              </button>
            ) : (
              <div></div>
            )}
            {step < 3 ? (
              <button
                type="button"
                className="btn btn-active btn-accent"
                onClick={handleNext}
                disabled={!name || !birthdate || !photo1Preview || !gender}
              >
                次へ
              </button>
            ) : step === 3 ? (
              <button
                type="button"
                className="btn btn-active btn-accent"
                onClick={handleSubmit}
                disabled={!name || !birthdate || !photo1Preview || !gender}
              >
                始める
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
