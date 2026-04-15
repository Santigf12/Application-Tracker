import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_HOST: str = os.getenv("DATABASE_HOST", "127.0.0.1")
    DATABASE_USER: str = os.getenv("DATABASE_USER", "root")
    DATABASE_PASSWORD: str = os.getenv("DATABASE_PASSWORD", "")
    DATABASE_NAME: str = os.getenv("DATABASE", "")
    DATABASE_PORT: int = int(os.getenv("DATABASE_PORT", "3306"))

    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}"
            f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
        )


settings = Settings()