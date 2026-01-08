import { useState, useEffect } from 'react';
import { getMyCertificates } from '../../api/certificate.api';
import { Loader } from '../../components/common/Loader';
import { Download, ExternalLink, Award } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await getMyCertificates();
      
      if (response.success && response.data.certificates) {
        const sortedCertificates = response.data.certificates.sort(
          (a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)
        );
        setCertificates(sortedCertificates);
      }
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  
  const handleDownload = async (courseId, courseName) => {
    try {
      setDownloading(courseId);
      
      const response = await axiosInstance.get(
        `/certificates/${courseId}/download`,
        {
          responseType: 'blob', 
        }
      );

      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${courseName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Certificate downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Certificates
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View and download your certificates
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="card text-center py-12">
          <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Complete courses to earn certificates
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.certificateId || cert._id}
              className="card border rounded-lg shadow-sm overflow-hidden"
            >
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-t-lg p-6 text-center">
                <Award className="h-12 w-12 mx-auto text-primary-600 dark:text-primary-400 mb-2" />
                <h3 className="text-lg font-bold mb-2">
                  {cert.course?.title || 'Course Certificate'}
                </h3>
                <p className="text-sm">Certificate of Completion</p>
                <p className="text-xs mt-4">
                  Issued on {cert.issuedAt ? formatDate(cert.issuedAt) : 'N/A'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  ID: {cert.certificateId || 'Pending'}
                </p>
              </div>

              <div className="flex gap-2 p-4">
                {cert.pdfUrl ? (
                  <button
                    onClick={() => handleDownload(cert.course._id, cert.course.title)}
                    disabled={downloading === cert.course._id}
                    className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {downloading === cert.course._id ? 'Downloading...' : 'Download'}
                  </button>
                ) : (
                  <span className="flex-1 text-center text-gray-500 py-2 border rounded">
                    Generating PDF...
                  </span>
                )}

                {/* {cert.verificationUrl ? (
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary flex items-center justify-center"
                    title="Verify Certificate"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null} */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;