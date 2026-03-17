import os
from dataclasses import dataclass
from typing import List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBClassifier


HERE = os.path.dirname(__file__)
MODEL_DIR = os.path.join(HERE, "model")
CSV_PATH = os.path.join(MODEL_DIR, "cybersecurity_intrusion_data.csv")
OUT_PATH = os.path.join(MODEL_DIR, "ids_pipeline.joblib")


TARGET_COL = "attack_detected"
DROP_COLS = ["session_id"]


@dataclass(frozen=True)
class Schema:
    categorical: List[str]
    numeric: List[str]


def infer_schema(df: pd.DataFrame) -> Schema:
    categorical = ["protocol_type", "encryption_used", "browser_type"]
    numeric = [
        "network_packet_size",
        "login_attempts",
        "session_duration",
        "ip_reputation_score",
        "failed_logins",
        "unusual_time_access",
    ]
    missing = [c for c in categorical + numeric + [TARGET_COL] if c not in df.columns]
    if missing:
        raise ValueError(f"CSV missing expected columns: {missing}")
    return Schema(categorical=categorical, numeric=numeric)


def build_pipeline(schema: Schema) -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), schema.categorical),
            ("num", StandardScaler(), schema.numeric),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )

    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=4,
        objective="binary:logistic",
        eval_metric="logloss",
    )

    return Pipeline(steps=[("preprocess", preprocessor), ("model", model)])


def load_data() -> pd.DataFrame:
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Dataset not found at '{CSV_PATH}'")
    return pd.read_csv(CSV_PATH)


def split_xy(df: pd.DataFrame) -> Tuple[pd.DataFrame, np.ndarray]:
    df = df.drop(columns=[c for c in DROP_COLS if c in df.columns])
    X = df.drop(columns=[TARGET_COL])
    y = df[TARGET_COL].astype(int).to_numpy()
    return X, y


def main() -> None:
    df = load_data()
    schema = infer_schema(df)
    X, y = split_xy(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = build_pipeline(schema)
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    print("Confusion matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("\nClassification report:")
    print(classification_report(y_test, y_pred, digits=4))

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, OUT_PATH)
    print(f"\nSaved fitted IDS pipeline to: {OUT_PATH}")


if __name__ == "__main__":
    main()

