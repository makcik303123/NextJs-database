import Head from "next/head";
import { Inter } from "next/font/google";
import Table from "react-bootstrap/Table";
import { Alert, Container } from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useState } from "react";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

type TUserItem = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  updatedAt: string;
};

type TGetServerSideProps = {
  statusCode: number;
  users: TUserItem[];
  pagination: TPaginationInfo | null;
};

type TPaginationInfo = {
  totalPages: number;
  currentPage: number;
};

export const getServerSideProps = (async (ctx: GetServerSidePropsContext): Promise<{ props: TGetServerSideProps }> => {
  const { query } = ctx;
  const page = query.page || 1;
  const limit = query.limit || 20;

  try {
    const res = await fetch(`http://localhost:3000/users/pages?page=${page}&limit=${limit}`, { method: "GET" });
    if (!res.ok) {
      return { props: { statusCode: res.status, users: [], pagination: null } };
    }
    const { usersData, totalPages } = await res.json();
    return {
      props: {
        statusCode: 200,
        users: usersData,
        pagination: {
          totalPages,
          currentPage: +page,
        },
      },
    };
  } catch (e) {
    return { props: { statusCode: 500, users: [], pagination: null } };
  }
}) satisfies GetServerSideProps<TGetServerSideProps>;

export default function Home({ statusCode, users, pagination }: TGetServerSideProps) {
  const router = useRouter();

  const handlePageChange = async (page: number, limit: number = 20) => {
    if (!pagination || page === pagination.currentPage) {
      return;
    }

    await router.push(`?page=${page}&limit=${limit}`);
  };

  if (statusCode !== 200) {
    return <Alert variant={"danger"}>Ошибка {statusCode} при загрузке данных</Alert>;
  }

  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={"mb-5"}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Дата обновления</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {pagination && (
            <MyPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </Container>
      </main>
    </>
  );
}

interface PoginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function MyPagination({ currentPage, totalPages, onPageChange }: PoginationProps) {
  const pagesToShow = 10;
  const pages = [];

  const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <Pagination.Item key={i} active={i === currentPage} onClick={() => onPageChange(i)}>
        {i}
      </Pagination.Item>
    );
  }

  return (
    <Pagination>
      <Pagination.First onClick={() => onPageChange(1)} />
      <Pagination.Prev onClick={() => onPageChange(Math.max(1, currentPage - 1))} />
      {pages}
      <Pagination.Next onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} />
      <Pagination.Last onClick={() => onPageChange(totalPages)} />
    </Pagination>
  );
}
