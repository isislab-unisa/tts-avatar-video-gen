package storage

import (
	"bytes"
	"context"
	"log"
	"net/url"
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
	access := os.Getenv("MINIO_ACCESS_KEY")
	secret := os.Getenv("MINIO_SECRET_KEY")
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
		if u, err := url.Parse(base); err == nil && u.Host != "" {
			pubSSL := strings.EqualFold(u.Scheme, "https")
			publicCl, err = minio.New(u.Host, &minio.Options{
				Creds:  credentials.NewStaticV4(access, secret, ""),
				Secure: pubSSL,
			})
			if err != nil {
				return nil, err
			}
		}
	}

	// Crea bucket se mancante
	exists, err := internal.BucketExists(ctx, bucket)
	if err != nil {
		return nil, err
	}
	if !exists {
		if err := internal.MakeBucket(ctx, bucket, minio.MakeBucketOptions{}); err != nil {
			return nil, err
		}
		log.Printf("[minio] created bucket %s\n", bucket)
	} else {
		log.Printf("[minio] bucket %s ok\n", bucket)
	}

	return &MinioStore{
		Client:       internal,
		PublicClient: publicCl,
		Bucket:       bucket,
	}, nil
}

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

func (s *MinioStore) PutMP4(ctx context.Context, data []byte) (string, error) {
	name := "videos/" + uuid.NewString() + ".mp4"
	c2, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()
	return s.PutObject(c2, name, data, "video/mp4")
}

func (s *MinioStore) PresignGet(ctx context.Context, objectName string, exp time.Duration) (string, error) {

	cl := s.PublicClient
	if cl == nil {
		cl = s.Client
	}
	u, err := cl.PresignedGetObject(ctx, s.Bucket, objectName, exp, nil)
	if err != nil {
		return "", err
	}
	return u.String(), nil
}

func (s *MinioStore) Remove(ctx context.Context, objectName string) error {
	return s.Client.RemoveObject(ctx, s.Bucket, objectName, minio.RemoveObjectOptions{})
}
