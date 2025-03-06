provider "google" {
  credentials = file("/Users/osh6/Documents/GitHub/aiscaler/src/terraform/terraform-sa-key.json")
  project     = "aiscaler"
  region      = "us-central1"
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "local_file" "private_key" {
  content         = tls_private_key.ssh_key.private_key_pem
  filename        = "${path.module}/id_rsa"
  file_permission = "0600"
}

resource "local_file" "public_key" {
  content  = tls_private_key.ssh_key.public_key_openssh
  filename = "${path.module}/id_rsa.pub"
}

resource "google_compute_project_metadata" "ssh_keys" {
  metadata = {
    ssh-keys = "aiscaler:${tls_private_key.ssh_key.public_key_openssh}"
  }
}

resource "google_compute_network" "vpc_aiscaler" {
  name                    = "vpc-aiscaler-${random_id.suffix.hex}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet_aiscaler" {
  name          = "subnet-aiscaler-${random_id.suffix.hex}"
  ip_cidr_range = "10.0.0.0/16"
  region        = "us-central1"
  network       = google_compute_network.vpc_aiscaler.id
}

resource "google_compute_firewall" "allow_ports" {
  name    = "allow-ports-${random_id.suffix.hex}"
  network = google_compute_network.vpc_aiscaler.name

  allow {
    protocol = "tcp"
    ports    = ["22", "3000", "8080"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_instance" "ubuntu_instance" {
  name         = "instance-ubuntu-${random_id.suffix.hex}"
  machine_type = "e2-micro"
  zone         = "us-central1-b"
  
  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  metadata = {
    ssh-keys = "aiscaler:${tls_private_key.ssh_key.public_key_openssh}"
  }

  network_interface {
    network    = google_compute_network.vpc_aiscaler.id
    subnetwork = google_compute_subnetwork.subnet_aiscaler.id
    access_config {}
  }
}

output "ubuntu_instance_external_ip" {
  description = "IP externe de l'instance Ubuntu"
  value       = google_compute_instance.ubuntu_instance.network_interface[0].access_config[0].nat_ip
}
