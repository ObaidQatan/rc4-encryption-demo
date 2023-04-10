import { useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { motion } from "framer-motion";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Toaster, toast } from "react-hot-toast";

import "./App.css";

function App() {
  const [plaintext, setPlaintext] = useState("");
  const [key, setKey] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [showDecoder, setShowDecoder] = useState<boolean>(false);

  const handleEncrypt = () => {
    if (plaintext.length === 0 || key.length === 0) {
      toast.error("Plaintext or key cannot be empty", {
        style: {
          backgroundColor: "#8a89a8",
          color: "#fff",
        },
        iconTheme: {
          secondary: "#a7a5d0",
          primary: "#fff",
        },
        icon: "🚫",
      });
      return;
    }
    const keyArray = key.split("").map((c) => c.charCodeAt(0));
    const cipher = rc4Encrypt(keyArray, plaintext);
    setCiphertext(cipher);
    setPlaintext("");
    setKey("");

    setTimeout(() => {
      setShowDecoder(true);
    }, 1000);
  };

  const handleDialogClosed = () => {
    setShowDecoder(!showDecoder);
    setPlaintext("");
    setKey("");
  };

  return (
    <div className="App">
      <Toaster position="top-center" reverseOrder={false} />
      <span>
        <img src="/favicon.svg" alt="" className="logo" />
      </span>
      <h1 className="title">RC4 Encryption React </h1>
      <div className="card">
        <input
          type="text"
          className="plain-text-input"
          placeholder="Enter text to encrypt"
          value={plaintext}
          onChange={(e) => {
            setPlaintext(e.target.value);
            setCiphertext("");
          }}
        />
        <input
          type="text"
          className="key-input"
          value={key}
          placeholder="Enter key for encryption"
          onChange={(e) => {
            setKey(e.target.value);
            setCiphertext("");
          }}
        />
      </div>

      {ciphertext?.length > 0 ? (
        <motion.div
          className="ciphertext-wrapper"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="ciphertext">
            <p>
              Ciphertext: <code>{ciphertext}</code>
              <hr />
            </p>
          </div>
          <CopyToClipboard
            text={ciphertext}
            onCopy={() =>
              toast.success("Copied to clipboard", {
                style: {
                  backgroundColor: "#8a89a8",
                  color: "#fff",
                },
                iconTheme: {
                  secondary: "#a7a5d0",
                  primary: "#fff",
                },
                icon: "📋",
              })
            }
          >
            <button
              style={{
                backgroundColor: "#646cff",
              }}
            >
              Copy to clipboard
            </button>
          </CopyToClipboard>
          <button
            onClick={() => setShowDecoder(true)}
            style={{
              backgroundColor: "#ffffff40",
            }}
          >
            Open Decoder
          </button>
        </motion.div>
      ) : (
        <button onClick={handleEncrypt} className="submit-btn">
          Encrypt
        </button>
      )}

      {showDecoder && <DecoderDialog onClose={handleDialogClosed} />}
    </div>
  );
}

const DecoderDialog = ({ onClose, onDecode }: any) => {
  const [ciphertext, setCiphertext] = useState("");
  const [key, setKey] = useState("");
  const [plaintext, setPlaintext] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleDecrypt = () => {
    const keyArray = key.split("").map((c) => c.charCodeAt(0));
    const plain = rc4Decrypt(keyArray, ciphertext);
    setPlaintext(plain);
  };

  const handleClose = () => {
    if (dialogRef?.current) {
      dialogRef.current.style.transform = "translateY(100%)";
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  return (
    <motion.div
      ref={dialogRef}
      className="dialog"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="closer">
        <button
          style={{
            backgroundColor: "#646cff",
          }}
          onClick={handleClose}
        >
          Close Decoder
        </button>
      </div>
      <input
        type="text"
        placeholder="Enter ciphertext"
        value={ciphertext}
        onChange={(e) => setCiphertext(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />
      <button
        style={{
          backgroundColor: "#ffffff40",
        }}
        onClick={handleDecrypt}
      >
        Decrypt
      </button>
      {plaintext?.length > 0 && (
        <div className="plaintext-wrapper">
          <hr />
          <p>
            Plaintext: <code>{plaintext}</code>
          </p>
        </div>
      )}
    </motion.div>
  );
};

function rc4Encrypt(key: number[], plaintext: string): string {
  let s: number[] = [];
  let j = 0;
  let output = "";

  // Initialize the s array
  for (let i = 0; i < 256; i++) {
    s[i] = i;
  }

  // Key-scheduling algorithm
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) % 256;
    let temp = s[i];
    s[i] = s[j];
    s[j] = temp;
  }

  // Pseudo-random generation algorithm
  let i = 0;
  j = 0;
  for (let k = 0; k < plaintext.length; k++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    let temp = s[i];
    s[i] = s[j];
    s[j] = temp;
    let t = (s[i] + s[j]) % 256;
    let cipherChar = plaintext.charCodeAt(k) ^ s[t];
    output += String.fromCharCode(cipherChar);
  }

  return output;
}

const rc4Decrypt = (key: number[], ciphertext: string): string => {
  let s: number[] = [];
  let j = 0;
  let output = "";

  // Initialize the s array
  for (let i = 0; i < 256; i++) {
    s[i] = i;
  }

  // Key-scheduling algorithm
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) % 256;
    let temp = s[i];
    s[i] = s[j];
    s[j] = temp;
  }

  // Pseudo-random generation algorithm
  let i = 0;
  j = 0;
  for (let k = 0; k < ciphertext.length; k++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    let temp = s[i];
    s[i] = s[j];
    s[j] = temp;
    let t = (s[i] + s[j]) % 256;
    let plaintextChar = ciphertext.charCodeAt(k) ^ s[t];
    output += String.fromCharCode(plaintextChar);
  }

  return output;
};

export default App;
