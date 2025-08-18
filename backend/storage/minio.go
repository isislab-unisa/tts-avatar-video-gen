package storage

import (
	"bytes"
	"context"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinioStore struct {
	Client *minio.Client
	Bucket string
}

// NewMinio crea il client e si assicura che il bucket esista
func NewMinio(ctx context.Context) (*MinioStore, error) {
	endpoint := os.Getenv("MINIO_ENDPOINT") // es: "localhost:9000"
	access := os.Getenv("MINIO_ACCESS_KEY")
	secret := os.Getenv("MINIO_SECRET_KEY")
	bucket := os.Getenv("MINIO_BUCKET")
	if bucket == "" {
		bucket = "dubme"
	}
	useSSL, _ := strconv.ParseBool(os.Getenv("MINIO_USE_SSL"))

	cl, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(access, secret, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, err
	}

	// crea bucket se non esiste
	exists, err := cl.BucketExists(ctx, bucket)
	if err != nil {
		return nil, err
	}
	if !exists {
		if err := cl.MakeBucket(ctx, bucket, minio.MakeBucketOptions{}); err != nil {
			return nil, err
		}
		log.Printf("[minio] created bucket %s\n", bucket)
	} else {
		log.Printf("[minio] bucket %s ok\n", bucket)
	}

	return &MinioStore{Client: cl, Bucket: bucket}, nil
}

// PutObject carica un blob nel bucket con content-type
func (s *MinioStore) PutObject(ctx context.Context, objectName string, data []byte, contentType string) (string, error) {
	reader := bytes.NewReader(data)
	_, err := s.Client.PutObject(ctx, s.Bucket, objectName, reader, int64(len(data)), minio.PutObjectOptions{
		ContentType:  contentType,
		StorageClass: "STANDARD",
	})
	if err != nil {
		return "", err
	}
	return objectName, nil
}

// PutMP4 salva un video mp4 con nome univoco
func (s *MinioStore) PutMP4(ctx context.Context, data []byte) (string, error) {
	name := "videos/" + uuid.NewString() + ".mp4"
	// timeout ragionevole
	c2, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	return s.PutObject(c2, name, data, "video/mp4")
}
