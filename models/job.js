"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Jobs {
  /** Create a job(from data), update db, return new job data.
   *
   * data should be { id, title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * */

  static async create({title, salary, equity, company_handle}) {
    const maxId = await db.query(
      `SELECT MAX(id)
      FROM jobs`
    );
    const maxIdPlusOne = maxId.rows[0].max + 1
    const result = await db.query(
          `INSERT INTO jobs
           (id, title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, title, salary, equity, company_handle`,
        [
          maxIdPlusOne, title, salary, equity, company_handle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, company_handle}, ...]
   * */

  static async findAll(title, minSalary, hasEquity) {
    if (title && minSalary && hasEquity) {
      if (hasEquity === false) {
        const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
                  FROM jobs
                  WHERE title ILIKE $1 
                  AND minSalary >= $2
                  ORDER BY title`, [`%${title}%`, minSalary]);
        return jobsRes.rows;
      }
      const jobsRes = await db.query(
      `SELECT title,
              salary,
              equity,
              company_handle AS "companyHandle"
              FROM jobs
              WHERE title ILIKE $1 
              AND minSalary >= $2
              AND equity > 0
              ORDER BY title`, [`%${title}%`, minSalary]);
    return jobsRes.rows;
    }
      if (title && minSalary) {
        const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
                  FROM jobs
                  WHERE title ILIKE $1 
                  AND minSalary >= $2
                  ORDER BY title`, [`%${title}%`, minSalary]);
        return jobsRes.rows;
    }
      if (title && hasEquity) {
        if (hasEquity === false) {
          const jobsRes = await db.query(
            `SELECT title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
                    FROM jobs
                    WHERE title ILIKE $1 
                    ORDER BY title`, [`%${title}%`]);
          return jobsRes.rows;
        }
        const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
                  FROM jobs
                  WHERE title ILIKE $1 
                  AND equity > 0
                  ORDER BY title`, [`%${title}%`]);
        return jobsRes.rows;
    }
      if (hasEquity) {
        if (hasEquity === false) {
            const jobsRes = await db.query(
              `SELECT title,
                      salary,
                      equity,
                      company_handle AS "companyHandle"
                      FROM jobs
                      ORDER BY title`);
            return jobsRes.rows;
        }
          const jobsRes = await db.query(
            `SELECT title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
                    FROM jobs
                    WHERE equity > 0
                    ORDER BY title`);
          return jobsRes.rows;
    }
    if (title) {
      const jobsRes = await db.query(
        `SELECT title,
                salary,
                equity,
                company_handle AS "companyHandle"
                WHERE title ILIKE $1 
                ORDER BY title`, [`%${title}%`]);
      return jobsRes.rows;
  }
    else {
      const jobsRes = await db.query(
        `SELECT title,
                salary,
                equity,
                company_handle AS "companyHandle"
                FROM jobs
                ORDER BY title`);
      return jobsRes.rows;
    }
  }

  /** Given a company handle, return jobs from company.
   *
   * Returns { title, salary, equity, company_handle }
   *   where handle is [{ handle}, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const jobsRes = await db.query(
      `SELECT title,
      salary,
      equity,
      company_handle AS "companyHandle"
      FROM jobs
      WHERE company_handle = $1
      ORDER BY title`,
        [handle]);

    const jobs = jobsRes.rows;

    if (!jobs) throw new NotFoundError(`No company: ${handle}`);

    return jobs;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          title: "title",
          salary: "salary",
          equity: "equity"
        });

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${id} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${handle}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job id not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const idRes = result.rows[0];

    if (!idRes) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Jobs;
