package storage

import (
	"bytes"
	"context"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinioStore struct {
	Client *minio.Client

	PublicClient *minio.Client
	Bucket       string
}

func NewMinio(ctx context.Context) (*MinioStore, error) {
	endpoint := strings.TrimSpace(os.Getenv("MINIO_ENDPOINT"))
	access := os.Getenv("MINIO_ROOT_USER")
	secret := os.Getenv("MINIO_ROOT_PASSWORD")
	bucket := os.Getenv("MINIO_BUCKET")
	if bucket == "" {
		bucket = "dubme"
	}
	useSSL, _ := strconv.ParseBool(os.Getenv("MINIO_USE_SSL"))

	internal, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(access, secret, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, err
	}

	var publicCl *minio.Client
	if base := strings.TrimSpace(os.Getenv("MINIO_PUBLIC_URL")); base != "" {
		log.Printf("[minio] configuring public client with URL: %s", base)

		internalEndpoint := os.Getenv("MINIO_ENDPOINT")
		if internalEndpoint == "" {
			internalEndpoint = "minio:9000"
		}
		log.Printf("[minio] using internal endpoint for connection: %s", internalEndpoint)

		publicCl, err = minio.New(internalEndpoint, &minio.Options{
			Creds:  credentials.NewStaticV4(access, secret, ""),
			Secure: useSSL,
		})
		if err != nil {
			log.Printf("[minio] failed to create public client: %v", err)
			return nil, err
		}
		log.Printf("[minio] public client created successfully with internal endpoint")
	} else {
		log.Printf("[minio] no public URL configured")
	}

	// Crea bucket se mancante
	log.Printf("[minio] checking if bucket %s exists", bucket)
	exists, err := internal.BucketExists(ctx, bucket)
	if err != nil {
		log.Printf("[minio] error checking bucket existence: %v", err)
		return nil, err
	}
	if !exists {
		log.Printf("[minio] bucket %s does not exist, creating...", bucket)
		if err := internal.MakeBucket(ctx, bucket, minio.MakeBucketOptions{}); err != nil {
			log.Printf("[minio] error creating bucket: %v", err)
			return nil, err
		}
		log.Printf("[minio] created bucket %s successfully", bucket)
	} else {
		log.Printf("[minio] bucket %s already exists", bucket)
	}

	return &MinioStore{
		Client:       internal,
		PublicClient: publicCl,
		Bucket:       bucket,
	}, nil
}

func (s *MinioStore) PutObject(ctx context.Context, objectName string, data []byte, contentType string) (string, error) {
	log.Printf("[minio] uploading object %s, size: %d bytes", objectName, len(data))
	reader := bytes.NewReader(data)
	_, err := s.Client.PutObject(ctx, s.Bucket, objectName, reader, int64(len(data)), minio.PutObjectOptions{
		ContentType:  contentType,
		StorageClass: "STANDARD",
	})
	if err != nil {
		log.Printf("[minio] upload failed for object %s: %v", objectName, err)
		return "", err
	}
	log.Printf("[minio] upload successful for object %s", objectName)
	return objectName, nil
}

func (s *MinioStore) PutMP4(ctx context.Context, data []byte) (string, error) {
	name := "videos/" + uuid.NewString() + ".mp4"
	c2, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()
	return s.PutObject(c2, name, data, "video/mp4")
}

func (s *MinioStore) PresignGet(ctx context.Context, objectName string, exp time.Duration) (string, error) {

	publicURL := os.Getenv("MINIO_PUBLIC_URL")
	if publicURL == "" {
		publicURL = "http://localhost:9000"
	}

	directURL := strings.TrimSuffix(publicURL, "/") + "/" + s.Bucket + "/" + objectName
	log.Printf("[minio] direct URL generated for object %s: %s", objectName, directURL)
	return directURL, nil
}

func (s *MinioStore) Remove(ctx context.Context, objectName string) error {
	return s.Client.RemoveObject(ctx, s.Bucket, objectName, minio.RemoveObjectOptions{})
}
